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
};

async function getProductosDeCategoriaCache(categoriaId: number): Promise<ProductoPublico[]> {
  "use cache";
  cacheTag(PRODUCTOS_TAG);
  cacheLife("hours");

  const productos = await getDb().producto.findMany({
    where: { categoriaId, activo: true },
    orderBy: [{ destacado: "desc" }, { nombre: "asc" }],
    select: { id: true, sku: true, nombre: true, slug: true, precioVenta: true, imagen: true, destacado: true },
  });

  return productos.map((p) => ({ ...p, precioVenta: p.precioVenta.toString() }));
}

// Se lee en el request (luego queda en caché), nunca durante el build.
export async function getProductosDeCategoria(categoriaId: number) {
  await connection();

  return getProductosDeCategoriaCache(categoriaId);
}
