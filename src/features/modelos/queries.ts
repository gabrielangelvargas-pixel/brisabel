import "server-only";

import { getDb } from "@/lib/db";

const productoDelModeloSelect = {
  id: true,
  sku: true,
  nombre: true,
  imagen: true,
  precioVenta: true,
  categoriaId: true,
  modeloId: true,
  variante: true,
  ordenVariante: true,
  categoria: { select: { nombre: true } },
} as const;

// Productos elegidos en el listado para agrupar.
export async function getProductosParaAgrupar(ids: number[]) {
  return getDb().producto.findMany({
    where: { id: { in: ids } },
    orderBy: [{ nombre: "asc" }, { sku: "asc" }],
    select: productoDelModeloSelect,
  });
}

export async function getModeloAdmin(id: number) {
  return getDb().modelo.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      variacion: true,
      productos: {
        orderBy: [{ ordenVariante: "asc" }, { variante: "asc" }],
        select: productoDelModeloSelect,
      },
    },
  });
}
