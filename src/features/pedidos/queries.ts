import "server-only";

import type { EstadoPedido } from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";

// Lecturas de pedidos (panel y "Mis pedidos"). Sin caché: siempre al día.

export async function getPedidosAdmin(filtros: { estado?: EstadoPedido }) {
  return getDb().pedido.findMany({
    where: filtros.estado ? { estado: filtros.estado } : {},
    orderBy: { creado: "desc" },
    take: 200,
    select: {
      id: true,
      estado: true,
      nombre: true,
      telefono: true,
      entrega: true,
      total: true,
      creado: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getPedidoAdmin(id: number) {
  return getDb().pedido.findUnique({
    where: { id },
    include: {
      usuario: { select: { username: true, dni: true } },
      items: {
        orderBy: { id: "asc" },
        include: { producto: { select: { imagen: true } } },
      },
    },
  });
}

export async function getPedidosDeUsuario(usuarioId: string) {
  return getDb().pedido.findMany({
    where: { usuarioId },
    orderBy: { creado: "desc" },
    take: 50,
    select: {
      id: true,
      estado: true,
      total: true,
      creado: true,
      items: { select: { id: true, nombre: true, variante: true, cantidad: true } },
    },
  });
}
