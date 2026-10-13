import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { PerfilDatos } from "@/features/cuenta/components/perfil-datos";
import { getPerfil } from "@/features/cuenta/queries";
import { MisDirecciones } from "@/features/direcciones/components/mis-direcciones";
import { getDireccionesDeUsuario } from "@/features/direcciones/queries";
import { EstadoBadge } from "@/features/pedidos/components/estado-badge";
import { numeroPedido } from "@/features/pedidos/estados";
import { getPedidosDeUsuario } from "@/features/pedidos/queries";
import { requireUser } from "@/lib/auth/session";
import { formatFechaHora, formatPrecio } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-3xl font-semibold">Mi cuenta</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Cargando...</p>}>
        <ProfileDetails />
      </Suspense>
    </main>
  );
}

async function ProfileDetails() {
  const user = await requireUser();
  const [perfil, direcciones, pedidos] = await Promise.all([
    getPerfil(user.id),
    getDireccionesDeUsuario(user.id),
    getPedidosDeUsuario(user.id),
  ]);

  return (
    <>
      <PerfilDatos dni={perfil?.dni ?? null} nombre={perfil?.nombre ?? user.nombre} username={perfil?.username ?? user.username} />

      <MisDirecciones direcciones={direcciones} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Mis pedidos</h2>
        {pedidos.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no hiciste pedidos.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pedidos.map((pedido) => (
              <li className="rounded-lg border border-line bg-surface p-4" key={pedido.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    Pedido {numeroPedido(pedido.id)}
                    <span className="ml-2 text-xs font-normal text-muted">{formatFechaHora(pedido.creado)}</span>
                  </p>
                  <EstadoBadge estado={pedido.estado} />
                </div>
                <ul className="mt-2 text-sm text-muted">
                  {pedido.items.map((item) => (
                    <li key={item.id}>
                      {item.cantidad} × {item.nombre}
                      {item.variante ? ` (${item.variante})` : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right font-bold text-brand tabular-nums">{formatPrecio(pedido.total.toString())}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={logoutAction} className="mt-6">
        <Button type="submit" variant="outline">
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </form>
    </>
  );
}
