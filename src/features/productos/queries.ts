import "server-only";

import { getCategoriasAdmin } from "@/features/categorias/queries";
import { getDb } from "@/lib/db";

// Lecturas del panel de administración.

export async function getProductosAdmin(filtros: { categoriaId?: number; buscar?: string }) {
  const buscar = filtros.buscar?.trim();

  return getDb().producto.findMany({
    where: {
      ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
      ...(buscar ? { OR: [{ nombre: { contains: buscar } }, { sku: { contains: buscar } }] } : {}),
    },
    orderBy: [{ modificado: "desc" }],
    take: 200,
    select: {
      id: true,
      sku: true,
      nombre: true,
      precioCosto: true,
      precioVenta: true,
      activo: true,
      destacado: true,
      imagen: true,
      variante: true,
      categoria: { select: { nombre: true } },
      modelo: { select: { id: true, nombre: true } },
    },
  });
}

export async function getProductoById(id: number) {
  return getDb().producto.findUnique({
    where: { id },
    select: {
      id: true,
      sku: true,
      nombre: true,
      slug: true,
      precioCosto: true,
      precioVenta: true,
      categoriaId: true,
      activo: true,
      destacado: true,
      imagen: true,
    },
  });
}

// Categorías donde se pueden cargar productos: las que no tienen
// subcategorías. La etiqueta muestra el camino: "Bijou › Aros › Plata".
export async function getCategoriasParaProductos() {
  const categorias = await getCategoriasAdmin();
  const porId = new Map(categorias.map((c) => [c.id, c]));

  return categorias
    .filter((c) => c._count.hijas === 0)
    .map((c) => ({
      id: c.id,
      etiqueta: c.ruta
        .split("/")
        .filter(Boolean)
        .map((id) => porId.get(Number(id))?.nombre)
        .filter(Boolean)
        .join(" › "),
    }));
}
