import type { Metadata } from "next";
import { Suspense } from "react";

import { CategoriaGrid, CategoriaGridSkeleton } from "@/features/categorias/components/categoria-grid";
import { getCategoriasPrincipales } from "@/features/categorias/public-queries";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Bijou, marroquinería, accesorios y regalos listos para obsequiar.",
};

export default function CatalogPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Catálogo</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-brand sm:text-5xl">Todo para regalar</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Elegí una categoría y encontrá el detalle ideal para cada persona y cada ocasión.
      </p>
      <div className="mt-10">
        <Suspense fallback={<CategoriaGridSkeleton cantidad={6} />}>
          <CategoriasPrincipales />
        </Suspense>
      </div>
    </main>
  );
}

async function CategoriasPrincipales() {
  const categorias = await getCategoriasPrincipales();

  if (categorias.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
        Estamos preparando el catálogo. Muy pronto vas a poder recorrerlo.
      </p>
    );
  }

  return <CategoriaGrid categorias={categorias} />;
}
