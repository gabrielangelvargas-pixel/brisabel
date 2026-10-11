import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { editarCategoriaAction } from "@/features/categorias/actions";
import { CategoriaForm } from "@/features/categorias/components/categoria-form";
import { getAlturaSubarbol, getCategoriaById, getPadresPosibles } from "@/features/categorias/queries";
import { categoriaIdSchema } from "@/features/categorias/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar categoría" };

export default function EditarCategoriaPage({ params }: PageProps<"/admin/categorias/[id]">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/categorias">
        ← Categorías
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Editar categoría</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ params }: Pick<PageProps<"/admin/categorias/[id]">, "params">) {
  await requireAdmin();

  const id = categoriaIdSchema.safeParse((await params).id);
  const categoria = id.success ? await getCategoriaById(id.data) : null;

  if (!categoria) {
    notFound();
  }

  const altura = await getAlturaSubarbol(categoria);
  const padres = await getPadresPosibles({ ruta: categoria.ruta, altura });

  return (
    <CategoriaForm
      action={editarCategoriaAction.bind(null, categoria.id)}
      defaultValues={categoria}
      padres={padres}
      submitLabel="Guardar cambios"
    />
  );
}
