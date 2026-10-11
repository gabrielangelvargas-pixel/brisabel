import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import giftImage from "@/assets/home/gift-story.webp";

const points = [
  "Productos seleccionados uno por uno",
  "Opciones para todos los presupuestos",
  "Ideas para cada persona y cada ocasión",
];

export function GiftStory() {
  return (
    <section className="bg-brand text-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:py-20 md:grid-cols-2 lg:gap-16">
        <div className="relative mx-auto w-full max-w-md md:order-2">
          <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[2.25rem] border border-white/25" />
          <Image
            alt="Cajas de regalo con moños junto a fragancias"
            className="relative aspect-[4/5] h-auto w-full rounded-[2rem] object-cover shadow-2xl"
            placeholder="blur"
            sizes="(min-width: 768px) 28rem, 100vw"
            src={giftImage}
          />
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-heart uppercase">Listo para regalar</p>
          <h2 className="mt-3 font-display text-3xl leading-tight font-semibold sm:text-4xl">
            Elegimos cada pieza para que regalar sea un placer
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/75">
            Sabemos que un regalo dice mucho. Por eso buscamos artículos lindos, de calidad y listos para
            entregar, para que sorprender sea fácil.
          </p>

          <ul className="mt-8 grid gap-4">
            {points.map((point) => (
              <li className="flex items-center gap-3" key={point}>
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-heart">
                  <Check className="size-4" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link
            className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-brand transition hover:bg-sand"
            href="/catalogo"
          >
            Descubrir regalos
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
