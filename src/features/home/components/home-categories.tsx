import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CategoriaGrid } from "@/features/categorias/components/categoria-grid";
import { getCategoriasPrincipales } from "@/features/categorias/public-queries";

// Categorías principales del catálogo. Si todavía no hay, la sección no se muestra.
export async function HomeCategories() {
  const categorias = await getCategoriasPrincipales();

  if (categorias.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pt-16 sm:pt-20" id="categorias">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Nuestro catálogo</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-brand sm:text-4xl">Explorá por categoría</h2>
        </div>
        <Link
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-accent"
          href="/catalogo"
        >
          Ver todo el catálogo
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-8">
        <CategoriaGrid categorias={categorias} />
      </div>
    </section>
  );
}
