import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Benefits } from "@/features/home/components/benefits";
import { CategoryGrid } from "@/features/home/components/category-grid";
import { GiftStory } from "@/features/home/components/gift-story";
import { Hero } from "@/features/home/components/hero";
import { Occasions } from "@/features/home/components/occasions";
import { RetailCta } from "@/features/home/components/retail-cta";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Benefits />

      <section className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pt-16 sm:pt-20" id="categorias">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Nuestro catálogo</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-brand sm:text-4xl">
              Explorá por categoría
            </h2>
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
          <CategoryGrid />
        </div>
      </section>

      <Occasions />
      <GiftStory />
      <RetailCta />
    </main>
  );
}
