import Link from "next/link";
import { FolderTree, LogOut } from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { appConfig } from "@/config/app";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  const usuario = await requireAdmin();

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#1f2320]">
      <header className="border-b border-[#e6ded3] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="text-xl font-semibold" href="/admin">
            {appConfig.name} Admin
          </Link>
          <form action={logoutAction}>
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d8cbbd] px-4 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
          Panel de administracion
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Hola, {usuario.nombre}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#69625b]">
          Desde aca vamos a gestionar categorias, productos y el catalogo de BrisaBel.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm transition hover:border-[#c7a18a]"
            href="/admin/categorias"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#f2e4db] text-[#7f4f3a]">
              <FolderTree className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">Categorias</h2>
            <p className="mt-2 text-sm leading-6 text-[#69625b]">
              Crear y revisar categorias padre e hijas del catalogo.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
