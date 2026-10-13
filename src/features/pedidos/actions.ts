"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  leerPedidoForm,
  pedidoSchema,
  type PedidoCampo,
  type PedidoFormValues,
} from "@/features/pedidos/schemas";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// ------------------------------------------------------- Finalizar compra

export type PedidoState = {
  error?: string;
  fieldErrors?: Partial<Record<PedidoCampo, string>>;
  values?: PedidoFormValues;
  // Productos que ya no se venden: el navegador los saca del carrito.
  noDisponibles?: number[];
  // Pedido creado: el navegador vacía el carrito y muestra la confirmación.
  pedido?: { id: number; total: string };
};

export async function crearPedidoAction(_prev: PedidoState, formData: FormData): Promise<PedidoState> {
  const usuario = await requireUser();
  const { values, input } = leerPedidoForm(formData);
  const parsed = pedidoSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    const { items, ...campos } = fieldErrors;

    return {
      values,
      error: items?.[0],
      fieldErrors: Object.fromEntries(Object.entries(campos).map(([campo, mensajes]) => [campo, mensajes?.[0]])),
    };
  }

  const datos = parsed.data;
  const db = getDb();

  // Precios y nombres actuales desde la base (lo del navegador puede estar viejo).
  const productos = await db.producto.findMany({
    where: { id: { in: datos.items.map((item) => item.id) }, activo: true },
    select: {
      id: true,
      sku: true,
      nombre: true,
      precioVenta: true,
      variante: true,
      modelo: { select: { variacion: true } },
    },
  });
  const porId = new Map(productos.map((producto) => [producto.id, producto]));
  const noDisponibles = datos.items.filter((item) => !porId.has(item.id)).map((item) => item.id);

  if (noDisponibles.length > 0) {
    return {
      values,
      noDisponibles,
      error: "Algunos productos ya no están disponibles y los sacamos de tu carrito. Revisá el pedido y confirmá de nuevo.",
    };
  }

  const items = datos.items.map(({ id, cantidad }) => {
    const producto = porId.get(id)!;

    return {
      productoId: id,
      sku: producto.sku,
      nombre: producto.nombre,
      variante: producto.modelo && producto.variante ? `${producto.modelo.variacion}: ${producto.variante}` : null,
      precio: producto.precioVenta,
      cantidad,
    };
  });
  const total = items.reduce((suma, item) => suma.add(item.precio.mul(item.cantidad)), new Prisma.Decimal(0));

  let pedido;

  try {
    pedido = await db.pedido.create({
      data: {
        usuarioId: usuario.id,
        nombre: datos.nombre,
        telefono: datos.telefono,
        entrega: datos.entrega,
        direccion: datos.entrega === "ENVIO" ? datos.direccion : null,
        localidad: datos.entrega === "ENVIO" ? datos.localidad : null,
        notas: datos.notas,
        total,
        items: { create: items },
      },
      select: { id: true, total: true },
    });
  } catch (error) {
    console.error("Pedido: no se pudo guardar", error);
    return { values, error: "No pudimos guardar tu pedido. Probá de nuevo en unos minutos." };
  }

  return { pedido: { id: pedido.id, total: pedido.total.toString() } };
}

// ------------------------------------------------------------ Panel: estado

const estadoSchema = z.object({
  id: z.coerce.number().int().positive(),
  estado: z.enum(["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"]),
});

export async function cambiarEstadoPedidoAction(formData: FormData) {
  await requireAdmin();

  const parsed = estadoSchema.safeParse({ id: formData.get("id"), estado: formData.get("estado") });

  if (!parsed.success) {
    redirect("/admin/pedidos");
  }

  const { id, estado } = parsed.data;

  await getDb().pedido.update({ where: { id }, data: { estado } });
  redirect(`/admin/pedidos/${id}?ok=estado`);
}
