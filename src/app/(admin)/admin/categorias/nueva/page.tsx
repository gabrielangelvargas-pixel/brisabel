import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { crearCategoriaAction } from "@/features/categorias/actions";
import { CategoriaForm } from "@/features/categorias/components/categoria-form";
import { getPadresPosibles } from "@/features/categorias/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NuevaCategoriaPage({ searchParams }: PageProps<"/admin/categorias/nueva">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/categorias">
        ← Categorías
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Nueva categoría</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/admin/categorias/nueva">, "searchParams">) {
  await requireAdmin();

  const [params, padres] = await Promise.all([searchParams, getPadresPosibles()]);
  // ?padre=ID preselecciona la categoría padre (botón "+" del listado).
  const padreId = Number(params.padre);
  const parentId = padres.some((padre) => padre.id === padreId) ? padreId : null;

  return (
    <CategoriaForm
      action={crearCategoriaAction}
      defaultValues={{ nombre: "", slug: "", descripcion: null, parentId, activa: true }}
      padres={padres}
      submitLabel="Crear categoría"
    />
  );
}
