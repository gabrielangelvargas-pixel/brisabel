import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

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

async function getProductosDeCategoriasCache(categoriaIds: number[]): Promise<ProductoPublico[]> {
  "use cache";
  cacheTag(PRODUCTOS_TAG);
  cacheLife("hours");

  const productos = await getDb().producto.findMany({
    where: { categoriaId: { in: categoriaIds }, activo: true },
    orderBy: [{ destacado: "desc" }, { nombre: "asc" }],
    select: {
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
    },
  });

  return productos.map((p) => ({ ...p, precioVenta: p.precioVenta.toString(), categoria: p.categoria.nombre }));
}

// Productos de una o varias categorías (ej. una categoría padre y todo su
// subárbol). Se lee en el request (luego queda en caché), nunca en el build.
export async function getProductosDeCategorias(categoriaIds: number[]) {
  await connection();

  return getProductosDeCategoriasCache([...categoriaIds].sort((a, b) => a - b));
}
