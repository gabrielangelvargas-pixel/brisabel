import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { CategoriaList } from "@/features/categorias/components/categoria-list";
import { getCategoriasAdmin } from "@/features/categorias/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Categorías" };

const mensajesOk: Record<string, string> = {
  creada: "Categoría creada.",
  actualizada: "Cambios guardados.",
  eliminada: "Categoría eliminada.",
};

const mensajesError: Record<string, string> = {
  "tiene-hijas": "No se puede eliminar una categoría que tiene subcategorías.",
  "tiene-productos": "No se puede eliminar una categoría que tiene productos. Movelos o eliminalos primero.",
};

export default function AdminCategoriasPage({ searchParams }: PageProps<"/admin/categorias">) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin">
        ← Panel
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">Categorías</h1>
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/admin/categorias/nueva"
        >
          <Plus className="size-4" />
          Nueva categoría
        </Link>
      </div>

      <Suspense fallback={<p className="mt-8 text-muted">Cargando...</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/categorias">, "searchParams">) {
  await requireAdmin();

  const [params, categorias] = await Promise.all([searchParams, getCategoriasAdmin()]);
  const ok = typeof params.ok === "string" ? mensajesOk[params.ok] : undefined;
  const error = typeof params.error === "string" ? mensajesError[params.error] : undefined;

  return (
    <div className="mt-8 grid gap-4">
      {ok ? (
        <p className="rounded-md border border-leaf/40 bg-brand-soft px-3 py-2 text-sm text-brand" role="status">
          {ok}
        </p>
      ) : null}
      {error ? <FormAlert>{error}</FormAlert> : null}
      <CategoriaList categorias={categorias} />
    </div>
  );
}
