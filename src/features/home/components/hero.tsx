import { ArrowRight, Gift, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import heroImage from "@/assets/home/hero.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sand">
      {/* Halos decorativos con los colores del logo */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-heart/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-leaf/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-24">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-heart/30 bg-surface/70 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-accent uppercase motion-safe:animate-fade-up">
            <Heart className="size-3.5 fill-heart text-heart" />
            Regalos que inspiran
          </p>

          <h1
            className="mt-6 font-display text-4xl leading-[1.1] font-semibold text-brand sm:text-5xl lg:text-6xl motion-safe:animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            El regalo perfecto, <span className="text-accent italic">elegido con el corazón</span>
          </h1>

          <p
            className="mt-6 text-lg leading-8 text-muted motion-safe:animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Bijou, marroquinería, accesorios y artículos listos para obsequiar. Encontrá ese detalle que
            hace sonreír, para alguien especial o para vos.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row motion-safe:animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-strong"
              href="/catalogo"
            >
              Ver catálogo
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-full border border-brand/20 bg-surface/70 px-7 text-sm font-semibold text-brand transition hover:border-brand/40 hover:bg-surface"
              href="#ocasiones"
            >
              Ideas para regalar
            </Link>
          </div>
        </div>

        <div className="relative motion-safe:animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-brand/15 ring-1 ring-black/5">
            <Image
              alt="Cartera, collares, reloj, fragancias y cajas de regalo sobre una mesa"
              className="aspect-[4/3] h-auto w-full object-cover lg:aspect-[16/11]"
              fetchPriority="high"
              loading="eager"
              placeholder="blur"
              sizes="(min-width: 1024px) 55vw, 100vw"
              src={heroImage}
            />
          </div>

          {/* Tarjeta flotante */}
          <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-surface/95 px-4 py-3 shadow-xl ring-1 ring-black/5 backdrop-blur sm:left-8">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Gift className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Listos para regalar</span>
              <span className="block text-xs text-muted">Ideas para cada ocasión</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
