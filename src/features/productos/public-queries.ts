import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

// Lecturas de la tienda. Se cachean con la etiqueta "productos", que las
// acciones del panel invalidan. Nunca incluyen el precio de costo.
export const PRODUCTOS_TAG = "productos";

export type ProductoPublico = {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  precioVenta: string; // Decimal serializado ("12500.00")
  imagen: string | null;
  destacado: boolean;
  variante: string | null;
  ordenVariante: number;
  modelo: { id: number; nombre: string; variacion: string } | null;
  categoria: string; // nombre de su categoría (hoja)
};

const SELECT_PUBLICO = {
  id: true,
  sku: true,
  nombre: true,
  slug: true,
  precioVenta: true,
  imagen: true,
  destacado: true,
  variante: true,
  ordenVariante: true,
  modelo: { select: { id: true, nombre: true, variacion: true } },
  categoria: { select: { nombre: true } },
} satisfies Prisma.ProductoSelect;

// Productos activos (destacados primero), ya serializados para la tienda.
async function buscarPublicos(where: Prisma.ProductoWhereInput): Promise<ProductoPublico[]> {
  const productos = await getDb().producto.findMany({
    where: { ...where, activo: true },
    orderBy: [{ destacado: "desc" }, { nombre: "asc" }],
    select: SELECT_PUBLICO,
  });

  return productos.map((p) => ({ ...p, precioVenta: p.precioVenta.toString(), categoria: p.categoria.nombre }));
}

async function getProductosDeCategoriasCache(categoriaIds: number[]) {
  "use cache";
  cacheTag(PRODUCTOS_TAG);
  cacheLife("hours");

  return buscarPublicos({ categoriaId: { in: categoriaIds } });
}

// Productos de una o varias categorías (ej. una categoría padre y todo su
// subárbol). Se lee en el request (luego queda en caché), nunca en el build.
export async function getProductosDeCategorias(categoriaIds: number[]) {
  await connection();

  return getProductosDeCategoriasCache([...categoriaIds].sort((a, b) => a - b));
}

async function getProductoPorSlugCache(slug: string) {
  "use cache";
  cacheTag(PRODUCTOS_TAG);
  cacheLife("hours");

  const producto = await getDb().producto.findFirst({
    where: { slug, activo: true },
    select: { id: true, categoriaId: true, modeloId: true },
  });

  if (!producto) {
    return null;
  }

  // Con modelo: todas sus variantes activas (incluida esta).
  const variantes = await buscarPublicos(producto.modeloId ? { modeloId: producto.modeloId } : { id: producto.id });

  return { id: producto.id, categoriaId: producto.categoriaId, variantes };
}

// Producto por slug (página para compartir) con las demás variantes de su
// modelo. La visibilidad de la categoría la verifica quien lo usa.
export async function getProductoPorSlug(slug: string) {
  await connection();

  return getProductoPorSlugCache(slug);
}
