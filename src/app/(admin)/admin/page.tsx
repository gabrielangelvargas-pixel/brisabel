import { ClipboardList, FolderTree, Images, Package } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ActivarNotificaciones } from "@/features/notificaciones/components/activar-notificaciones";
import { requireAdmin } from "@/lib/auth/session";
import { getPushPublicKey } from "@/lib/push";

const secciones = [
  {
    titulo: "Pedidos",
    descripcion: "Revisá los pedidos de la tienda y actualizá su estado.",
    href: "/admin/pedidos",
    icon: ClipboardList,
  },
  {
    titulo: "Categorías",
    descripcion: "Organizá el catálogo en categorías y subcategorías.",
    href: "/admin/categorias",
    icon: FolderTree,
  },
  {
    titulo: "Productos",
    descripcion: "Cargá productos con su SKU, precios e imagen.",
    href: "/admin/productos",
    icon: Package,
  },
  {
    titulo: "Portada",
    descripcion: "Fotos del slider de la página de inicio.",
    href: "/admin/portada",
    icon: Images,
  },
];

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <AdminHome />
      </Suspense>
    </main>
  );
}

async function AdminHome() {
  const user = await requireAdmin();
  const pushPublicKey = getPushPublicKey();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Panel de administración
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Hola, {user.nombre}</h1>
      <p className="mt-2 text-muted">Desde acá administrás la tienda.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {secciones.map(({ titulo, descripcion, href, icon: Icon }) => (
          <li key={href}>
            <Link
              className="flex h-full gap-4 rounded-lg border border-line bg-surface p-5 transition hover:border-brand/30 hover:shadow-sm"
              href={href}
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{titulo}</span>
                <span className="mt-1 block text-sm text-muted">{descripcion}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {pushPublicKey ? (
        <section className="mt-8 rounded-lg border border-line bg-surface p-5">
          <h2 className="font-semibold">Avisos de pedidos nuevos</h2>
          <p className="mt-1 text-sm text-muted">Activalos en cada dispositivo donde quieras enterarte al instante.</p>
          <ActivarNotificaciones className="mt-4" publicKey={pushPublicKey} />
        </section>
      ) : null}
    </>
  );
}
