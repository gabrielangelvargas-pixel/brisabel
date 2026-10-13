import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EstadoBadge } from "@/features/pedidos/components/estado-badge";
import { ENTREGAS, ESTADOS_PEDIDO, numeroPedido } from "@/features/pedidos/estados";
import { getPedidosAdmin } from "@/features/pedidos/queries";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { formatFechaHora, formatPrecio } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos" };

export default function AdminPedidosPage({ searchParams }: PageProps<"/admin/pedidos">) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin">
        ← Panel
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Pedidos</h1>

      <Suspense fallback={<p className="mt-8 text-muted">Cargando...</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function esEstado(valor: unknown): valor is EstadoPedido {
  return typeof valor === "string" && valor in ESTADOS_PEDIDO;
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/pedidos">, "searchParams">) {
  await requireAdmin();

  const { estado: param } = await searchParams;
  const estado = esEstado(param) ? param : undefined;
  const pedidos = await getPedidosAdmin({ estado });
  const filtros: { label: string; valor?: EstadoPedido }[] = [
    { label: "Todos" },
    ...Object.entries(ESTADOS_PEDIDO).map(([valor, { label }]) => ({ label, valor: valor as EstadoPedido })),
  ];

  return (
    <div className="mt-6 grid gap-4">
      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <Link
            aria-current={filtro.valor === estado ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition",
              filtro.valor === estado ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand/40",
            )}
            href={filtro.valor ? `/admin/pedidos?estado=${filtro.valor}` : "/admin/pedidos"}
            key={filtro.label}
          >
            {filtro.label}
          </Link>
        ))}
      </nav>

      {pedidos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-muted">
          {estado ? "No hay pedidos en este estado." : "Todavía no hay pedidos."}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <Link
                className="grid gap-1 p-4 transition hover:bg-brand-soft/50 sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-4"
                href={`/admin/pedidos/${pedido.id}`}
              >
                <span>
                  <span className="block font-semibold">{numeroPedido(pedido.id)}</span>
                  <span className="block text-xs text-muted">{formatFechaHora(pedido.creado)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{pedido.nombre}</span>
                  <span className="block text-xs text-muted">
                    {pedido.telefono} · {ENTREGAS[pedido.entrega]} · {pedido._count.items}{" "}
                    {pedido._count.items === 1 ? "producto" : "productos"}
                  </span>
                </span>
                <span className="flex items-center gap-3 sm:justify-end">
                  <EstadoBadge estado={pedido.estado} />
                  <span className="font-bold text-brand tabular-nums">{formatPrecio(pedido.total.toString())}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
