"use client";

import { ArrowRight, Heart } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

export type SlidePortada = {
  key: string;
  ocasion: string;
  frase: string | null;
  src: string | StaticImageData;
  enlace: string | null;
};

const fraseGeneral = "Bijou, marroquinería y detalles listos para obsequiar, para alguien especial o para vos.";

// Portada de la Home: fotos de momentos de regalo a pantalla completa, con el
// título encima. Avanza sola (la barra de cada foto marca el tiempo, como las
// historias de Instagram); se pausa con el mouse encima o tocando, y se
// puede deslizar con el dedo o elegir una foto tocando su barra.
export function PortadaSlider({ slides }: { slides: SlidePortada[] }) {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const inicioToque = useRef<number | null>(null);

  const total = slides.length;
  const slide = slides[activo];
  const ir = (indice: number) => setActivo((indice + total) % total);
  const pausa = { animationPlayState: pausado ? "paused" : "running" } as const;

  return (
    <section
      aria-label="Portada"
      aria-roledescription="carrusel"
      className="relative isolate h-[calc(100svh-5rem)] max-h-[56rem] min-h-[32rem] md:h-[calc(100svh-6rem)] lg:h-[calc(100svh-7rem)] overflow-hidden bg-brand-strong text-white"
      onPointerDown={(event) => {
        inicioToque.current = event.clientX;
        if (event.pointerType !== "mouse") setPausado(true);
      }}
      onPointerEnter={(event) => event.pointerType === "mouse" && setPausado(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setPausado(false)}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") setPausado(false);
        if (inicioToque.current === null || total < 2) return;

        const recorrido = event.clientX - inicioToque.current;
        inicioToque.current = null;
        if (Math.abs(recorrido) > 50) ir(activo + (recorrido < 0 ? 1 : -1));
      }}
    >
      {/* Fotos apiladas: la activa aparece con un fundido y un zoom lento. */}
      {slides.map((s, i) => (
        <div
          aria-hidden={i !== activo}
          className={cn("absolute inset-0 -z-10 transition-opacity duration-1000", i === activo ? "opacity-100" : "opacity-0")}
          key={s.key}
        >
          <Image
            alt=""
            className={cn("object-cover", i === activo && "motion-safe:animate-ken-burns")}
            fill
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            placeholder={typeof s.src === "string" ? "empty" : "blur"}
            sizes="100vw"
            src={s.src}
            style={i === activo ? pausa : undefined}
            unoptimized={typeof s.src === "string"}
          />
        </div>
      ))}

      {/* Degradés para que el texto se lea sobre cualquier foto. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/45 via-transparent to-transparent lg:block" />

      <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-5 pb-8 sm:pb-12 lg:pb-16">
        <p
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase ring-1 ring-white/30 backdrop-blur motion-safe:animate-fade-up"
          key={`ocasion-${slide.key}`}
        >
          <Heart className="size-3.5 fill-heart text-heart" />
          {slide.ocasion}
        </p>

        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
          El regalo perfecto, <span className="text-heart italic">elegido con el corazón</span>
        </h1>

        <p
          className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg motion-safe:animate-fade-up"
          key={`frase-${slide.key}`}
        >
          {slide.frase ?? fraseGeneral}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
          <Link
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm sm:px-6 font-semibold text-brand shadow-lg transition hover:bg-brand-soft"
            href="/catalogo"
          >
            Ver catálogo
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-full bg-white/10 px-3 text-center sm:px-6 text-sm leading-tight font-semibold ring-1 ring-white/40 backdrop-blur transition hover:bg-white/20"
            href={slide.enlace ?? "#ocasiones"}
          >
            {slide.enlace ? `Regalos para ${slide.ocasion}` : "Ideas para regalar"}
          </Link>
        </div>

        {/* Barras de avance: también sirven para elegir una foto. */}
        {total > 1 ? (
          <div className="mt-8 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                aria-current={i === activo}
                aria-label={`Ver ${s.ocasion}`}
                className="group flex h-6 w-full max-w-16 items-center"
                key={s.key}
                onClick={() => ir(i)}
                type="button"
              >
                <span className="h-1 w-full overflow-hidden rounded-full bg-white/30 transition group-hover:bg-white/50">
                  <span
                    className={cn(
                      "block h-full rounded-full bg-white",
                      i < activo && "w-full",
                      i > activo && "w-0",
                      i === activo && "animate-progreso motion-reduce:w-full motion-reduce:animate-none",
                    )}
                    key={i === activo ? `activo-${activo}` : undefined}
                    onAnimationEnd={i === activo ? () => ir(activo + 1) : undefined}
                    style={i === activo ? pausa : undefined}
                  />
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
