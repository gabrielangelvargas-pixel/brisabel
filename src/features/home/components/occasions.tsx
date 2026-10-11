import Link from "next/link";

import { occasions } from "@/features/home/content";

export function Occasions() {
  return (
    <section className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 py-16 sm:py-20" id="ocasiones">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Para cada momento</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-brand sm:text-4xl">
          ¿Qué estás celebrando?
        </h2>
        <p className="mt-4 text-muted">
          Contanos la ocasión y te ayudamos a encontrar el regalo indicado.
        </p>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-3">
        {occasions.map((occasion) => (
          <li key={occasion}>
            <Link
              className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-heart/40 hover:bg-accent-soft hover:text-accent"
              href="/catalogo"
            >
              {occasion}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
