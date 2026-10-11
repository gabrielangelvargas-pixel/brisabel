import type { Metadata } from "next";

import { CategoryGrid } from "@/features/home/components/category-grid";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Bijou, marroquinería, accesorios y regalos listos para obsequiar.",
};

// Vitrina provisoria: muestra las categorías hasta que existan los productos.
export default function CatalogPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Catálogo</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-brand sm:text-5xl">Todo para regalar</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Estamos cargando nuestros productos. Muy pronto vas a poder recorrer cada categoría y comprar
        online.
      </p>
      <div className="mt-10">
        <CategoryGrid />
      </div>
    </main>
  );
}
