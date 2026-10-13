import { Heart, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { TELEFONO_TIPOS } from "@/features/direcciones/schemas";
import { cambiarEstadoPedidoAction } from "@/features/pedidos/actions";
import { EstadoBadge } from "@/features/pedidos/components/estado-badge";
import { ENTREGAS, ESTADOS_PEDIDO, numeroPedido } from "@/features/pedidos/estados";
import { getPedidoAdmin } from "@/features/pedidos/queries";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { requireAdmin } from "@/lib/auth/session";
import { formatFechaHora, formatPrecio } from "@/lib/format";

export const metadata: Metadata = { title: "Pedido" };

type Props = PageProps<"/admin/pedidos/[id]">;

export default function AdminPedidoPage({ params, searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/pedidos">
        ← Pedidos
      </Link>
      <Suspense fallback={<p className="mt-8 text-muted">Cargando...</p>}>
        <Detalle params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Detalle({ params, searchParams }: Props) {
  await requireAdmin();

  const id = Number((await params).id);
  const pedido = Number.isInteger(id) && id > 0 ? await getPedidoAdmin(id) : null;

  if (!pedido) {
    notFound();
  }

  const { ok } = await searchParams;
  // Retiro: teléfono del pedido. Envío: el de la dirección elegida.
  const telefono = pedido.direccion
    ? { numero: pedido.direccion.telefono, tipo: pedido.direccion.telefonoTipo }
    : pedido.telefono
      ? { numero: pedido.telefono, tipo: null }
      : null;

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">Pedido {numeroPedido(pedido.id)}</h1>
        <EstadoBadge estado={pedido.estado} />
      </div>
      <p className="mt-1 text-sm text-muted">{formatFechaHora(pedido.creado)}</p>

      {ok === "estado" ? (
        <p className="mt-4 rounded-md border border-leaf/40 bg-brand-soft px-3 py-2 text-sm text-brand" role="status">
          Estado actualizado.
        </p>
      ) : null}

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[1fr_18rem]">
        <section className="rounded-lg border border-line bg-surface">
          <h2 className="border-b border-line px-4 py-3 font-semibold">Productos</h2>
          <ul className="divide-y divide-line">
            {pedido.items.map((item) => {
              const imagenUrl = productoImagenUrl(item.producto?.imagen ?? null);

              return (
                <li className="flex items-center gap-3 p-4" key={item.id}>
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-sand ring-1 ring-line">
                    {imagenUrl ? (
                      <Image alt="" className="object-cover" fill sizes="3.5rem" src={imagenUrl} unoptimized />
                    ) : (
                      <Heart className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-heart/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-xs text-muted">
                      {item.variante ? `${item.variante} · ` : ""}SKU {item.sku}
                    </p>
                    <p className="text-xs text-muted tabular-nums">
                      {item.cantidad} × {formatPrecio(item.precio.toString())}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPrecio(item.precio.mul(item.cantidad).toString())}</p>
                </li>
              );
            })}
          </ul>
          <div className="flex items-baseline justify-between border-t border-line px-4 py-3">
            <p className="font-semibold">Total</p>
            <p className="text-2xl font-bold text-brand tabular-nums">{formatPrecio(pedido.total.toString())}</p>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="grid gap-3 rounded-lg border border-line bg-surface p-4 text-sm">
            <h2 className="font-semibold">Cliente</h2>
            <p>
              {pedido.nombre}
              <span className="block text-xs text-muted">
                Usuario: {pedido.usuario.username}
                {pedido.usuario.dni ? ` · DNI ${pedido.usuario.dni}` : ""}
              </span>
            </p>
            {telefono ? (
              <a className="inline-flex items-center gap-2 font-medium text-accent hover:underline" href={`tel:${telefono.numero}`}>
                <Phone className="size-4" />
                {telefono.numero}
                {telefono.tipo ? <span className="text-xs font-normal text-muted">({TELEFONO_TIPOS[telefono.tipo]})</span> : null}
              </a>
            ) : null}
            <div>
              <p className="font-medium">{ENTREGAS[pedido.entrega]}</p>
              {pedido.direccion ? (
                <p className="text-muted">
                  {pedido.direccion.calle}
                  <span className="block">
                    {pedido.direccion.barrio}, {pedido.direccion.ciudad}, {pedido.direccion.provincia}
                  </span>
                </p>
              ) : null}
            </div>
            {pedido.notas ? (
              <p className="rounded-md bg-sand px-3 py-2 whitespace-pre-line">{pedido.notas}</p>
            ) : null}
          </section>

          <form action={cambiarEstadoPedidoAction} className="grid gap-3 rounded-lg border border-line bg-surface p-4">
            <input name="id" type="hidden" value={pedido.id} />
            <label className="grid gap-2 text-sm font-semibold" htmlFor="estado">
              Estado del pedido
              <select
                className="h-11 rounded-md border border-line bg-surface px-3 font-normal outline-none focus:border-brand"
                defaultValue={pedido.estado}
                id="estado"
                name="estado"
              >
                {Object.entries(ESTADOS_PEDIDO).map(([valor, { label }]) => (
                  <option key={valor} value={valor}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">Guardar estado</Button>
          </form>
        </div>
      </div>
    </>
  );
}
