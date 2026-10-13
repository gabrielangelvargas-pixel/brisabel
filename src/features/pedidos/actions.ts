"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { direccionSchema } from "@/features/direcciones/schemas";
import {
  direccionNueva,
  leerPedidoForm,
  pedidoSchema,
  type PedidoCampo,
  type PedidoFormValues,
} from "@/features/pedidos/schemas";
import { Prisma } from "@/generated/prisma/client";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { numeroPedido } from "@/features/pedidos/estados";
import { ROLES } from "@/lib/auth/roles";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { formatPrecio } from "@/lib/format";
import { enviarPush } from "@/lib/push";

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

  // Dirección guardada: tiene que ser del usuario.
  const guardada =
    datos.entrega === "ENVIO" && datos.direccionId !== "nueva"
      ? await db.direccion.findFirst({ where: { id: Number(datos.direccionId), usuarioId: usuario.id, archivada: false }, select: { id: true } })
      : null;

  if (datos.entrega === "ENVIO" && datos.direccionId !== "nueva" && !guardada) {
    return { values, fieldErrors: { direccionId: "Elegí una dirección de entrega." } };
  }

  let pedido;

  try {
    pedido = await db.$transaction(async (tx) => {
      // Retiro: solo el teléfono. Envío: la dirección (nueva se guarda para la
      // próxima; guardada se marca como la última usada).
      let direccionId: number | null = null;

      if (datos.entrega === "ENVIO") {
        const direccion = guardada
          ? await tx.direccion.update({ where: { id: guardada.id }, data: { modificado: new Date() } })
          : await tx.direccion.create({
              data: { usuarioId: usuario.id, ...direccionSchema.parse(direccionNueva(datos)) },
            });
        direccionId = direccion.id;
      }

      return tx.pedido.create({
        data: {
          usuarioId: usuario.id,
          nombre: datos.nombre,
          entrega: datos.entrega,
          telefono: datos.entrega === "RETIRO" ? datos.telefono.trim() : null,
          direccionId,
          notas: datos.notas,
          total,
          items: { create: items },
        },
        select: { id: true, total: true },
      });
    });
  } catch (error) {
    console.error("Pedido: no se pudo guardar", error);
    return { values, error: "No pudimos guardar tu pedido. Probá de nuevo en unos minutos." };
  }

  // Aviso a los administradores, después de responder (no demora al cliente).
  const { id, total: totalPedido } = pedido;
  after(() =>
    enviarPush(
      { rol: { codigo: ROLES.ADMIN } },
      {
        titulo: `Nuevo pedido ${numeroPedido(id)}`,
        cuerpo: `${datos.nombre} · ${formatPrecio(totalPedido.toString())}`,
        url: `/admin/pedidos/${id}`,
        etiqueta: `pedido-${id}`,
      },
    ),
  );

  return { pedido: { id: pedido.id, total: pedido.total.toString() } };
}

// ------------------------------------------------------------ Panel: estado

const AVISOS_ESTADO: Partial<Record<EstadoPedido, { titulo: (numero: string) => string; cuerpo: string }>> = {
  CONFIRMADO: { titulo: (n) => `Tu pedido ${n} fue confirmado`, cuerpo: "Ya lo estamos preparando. ¡Gracias por elegir Brisabel!" },
  ENTREGADO: { titulo: (n) => `¡Tu pedido ${n} fue entregado!`, cuerpo: "Esperamos que lo disfrutes. ¡Gracias por elegir Brisabel!" },
  CANCELADO: { titulo: (n) => `Tu pedido ${n} fue cancelado`, cuerpo: "Si tenés alguna duda, escribinos." },
};

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

  const anterior = await getDb().pedido.findUnique({ where: { id }, select: { estado: true } });

  if (!anterior) {
    redirect("/admin/pedidos");
  }

  const pedido = await getDb().pedido.update({ where: { id }, data: { estado }, select: { usuarioId: true } });
  const aviso = AVISOS_ESTADO[estado];

  // Aviso al cliente solo si el estado cambió (y no al volver a Pendiente).
  if (aviso && anterior.estado !== estado) {
    after(() =>
      enviarPush(
        { id: pedido.usuarioId },
        { titulo: aviso.titulo(numeroPedido(id)), cuerpo: aviso.cuerpo, url: "/perfil", etiqueta: `pedido-${id}` },
      ),
    );
  }

  redirect(`/admin/pedidos/${id}?ok=estado`);
}
