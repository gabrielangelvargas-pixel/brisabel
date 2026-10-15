import { ArrowUpRight, Gift, Heart, Sparkles, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import giftImage from "@/assets/home/gift-story.webp";
import { cn } from "@/lib/cn";

const cinta = [
  "Listo para regalar",
  "Elegido uno por uno",
  "Para todos los presupuestos",
  "Envíos coordinados",
  "Bijou · Marroquinería · Accesorios",
  "Regalos que inspiran",
];

const tarjetas = [
  {
    titulo: "Elegidos uno por uno",
    texto: "Nada de relleno: solo cosas que nos encantaría recibir.",
    icon: Sparkles,
    clase: "bg-orange text-white",
    iconClase: "bg-white/20 text-white",
    rotar: "md:-rotate-1",
  },
  {
    titulo: "Para todos los bolsillos",
    texto: "Detalles chiquitos o regalos de esos que se recuerdan.",
    icon: Wallet,
    clase: "bg-accent-soft text-ink",
    iconClase: "bg-white text-accent",
    rotar: "md:rotate-1",
  },
  {
    titulo: "Listo para entregar",
    texto: "Vos solo pensá la dedicatoria. Lo demás, de nuestra parte.",
    icon: Gift,
    clase: "bg-brand text-white",
    iconClase: "bg-white/15 text-heart",
    rotar: "md:rotate-1",
  },
];

// "Listo para regalar": cinta animada con mensajes + grilla de tarjetas de
// colores (estilo bento) con la foto de regalos como tarjeta principal.
export function GiftStory() {
  return (
    <section className="overflow-hidden bg-canvas pb-16 sm:pb-20">
      {/* Cinta que se desliza: la lista va dos veces para que el loop no se corte. */}
      <div className="-rotate-1 bg-heart py-3 text-white shadow-md">
        <div className="flex w-max motion-safe:animate-marquee">
          {[0, 1].map((copia) => (
            <ul aria-hidden={copia === 1} className="flex shrink-0 items-center" key={copia}>
              {cinta.map((texto) => (
                <li
                  className="flex items-center gap-4 px-4 font-display text-lg font-semibold whitespace-nowrap italic sm:text-xl"
                  key={texto}
                >
                  {texto}
                  <Heart aria-hidden className="size-4 fill-white" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 w-full max-w-7xl px-5 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl font-display text-3xl leading-tight font-semibold text-brand sm:text-5xl">
            Regalar nunca fue <span className="relative whitespace-nowrap text-accent italic">tan fácil</span>{" "}
            <span aria-hidden>✨</span>
          </h2>
          <Link
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-brand"
            href="/catalogo"
          >
            Descubrir regalos
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {/* Tarjeta principal con la foto. */}
          <Link
            className="group relative min-h-80 overflow-hidden rounded-3xl sm:col-span-2 lg:row-span-2"
            href="/catalogo"
          >
            <Image
              alt="Cajas de regalo con moños junto a fragancias"
              className="object-cover transition duration-700 group-hover:scale-105"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 100vw"
              src={giftImage}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute top-4 left-4 rotate-[-4deg] rounded-full bg-gold-light px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase shadow-md">
              Listo para regalar
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
              <p className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
                Ese “¡no te hubieras molestado!” empieza acá
              </p>
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition group-hover:rotate-45">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </Link>

          {tarjetas.map(({ titulo, texto, icon: Icon, clase, iconClase, rotar }) => (
            <div
              className={cn(
                "flex items-start gap-4 rounded-3xl p-5 transition duration-300 hover:rotate-0 hover:-translate-y-1 sm:flex-col sm:justify-between sm:gap-6 sm:p-6",
                clase,
                rotar,
              )}
              key={titulo}
            >
              <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-2xl", iconClase)}>
                <Icon className="size-6" />
              </span>
              <div>
                <h3 className="font-display text-xl leading-tight font-semibold sm:text-2xl">{titulo}</h3>
                <p className="mt-2 text-sm leading-6 opacity-85">{texto}</p>
              </div>
            </div>
          ))}

          {/* Llamado a las ideas por ocasión. */}
          <Link
            className="group flex items-center gap-4 rounded-3xl border-2 border-dashed border-brand/25 bg-gold-soft p-5 transition sm:flex-col sm:items-start sm:justify-between sm:gap-6 sm:p-6 duration-300 hover:-translate-y-1 hover:border-brand/50 md:-rotate-1 md:hover:rotate-0"
            href="#ocasiones"
          >
            <span className="text-4xl" aria-hidden>
              🎁
            </span>
            <div>
              <h3 className="font-display text-xl leading-tight font-semibold text-brand sm:text-2xl">¿No sabés qué regalar?</h3>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Mirá ideas por ocasión
                <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
