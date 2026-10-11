import { Store } from "lucide-react";
import Link from "next/link";

export function RetailCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-sand px-6 py-12 text-center sm:px-12">
        <div aria-hidden className="absolute -top-20 -right-20 size-64 rounded-full bg-leaf/20 blur-2xl" />
        <div aria-hidden className="absolute -bottom-24 -left-16 size-64 rounded-full bg-heart/20 blur-2xl" />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-surface text-brand shadow-sm">
            <Store className="size-7" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold text-brand sm:text-4xl">¿Tenés un comercio?</h2>
          <p className="mt-4 text-lg text-muted">
            Además de vender al público, abastecemos a minoristas. Recorré el catálogo y consultanos por
            precios y condiciones para tu negocio.
          </p>
          <Link
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white transition hover:bg-brand-strong"
            href="/catalogo"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
