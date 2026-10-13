import { Expand, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

// Foto del producto (o un fondo con los colores de la marca si no tiene).
// El contenedor define el tamaño: la imagen lo llena.
export function ProductoImagen({ nombre, imagenUrl, sizes }: { nombre: string; imagenUrl: string | null; sizes: string }) {
  if (!imagenUrl) {
    return (
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-sand via-brand-soft to-accent-soft">
        <Heart className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-heart/40" />
      </div>
    );
  }

  return (
    <Image
      alt={nombre}
      className="object-cover transition duration-500 ease-out group-hover:scale-105"
      fill
      sizes={sizes}
      src={imagenUrl}
      unoptimized
    />
  );
}

export function BadgeDestacado({ className }: { className?: string }) {
  return (
    <span
      aria-label="Destacado"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-strong text-white shadow-md ring-2 ring-white",
        className,
      )}
      role="img"
      title="Destacado"
    >
      <Sparkles className="size-4" />
    </span>
  );
}

type ProductoCardProps = {
  nombre: string;
  imagenUrl: string | null;
  destacado: boolean;
  // Al tocar la imagen (ej. abrir el detalle).
  onAbrir?: () => void;
  // Datos bajo el nombre: variante, precio, botones.
  children: ReactNode;
};

// Diseño de la tarjeta de producto de la tienda.
export function ProductoCard({ nombre, imagenUrl, destacado, onAbrir, children }: ProductoCardProps) {
  const imagen = <ProductoImagen imagenUrl={imagenUrl} nombre={nombre} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />;

  const tarjeta = (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-surface transition duration-300 hover:-translate-y-0.5",
        destacado
          ? "rounded-[calc(1rem-2px)]"
          : "rounded-2xl border border-line shadow-sm hover:border-brand/15 hover:shadow-lg hover:shadow-brand/10",
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {onAbrir ? (
          <button aria-label={`Ver detalle de ${nombre}`} className="absolute inset-0 cursor-zoom-in" onClick={onAbrir} type="button">
            {imagen}
          </button>
        ) : (
          imagen
        )}
        {destacado ? <BadgeDestacado className="pointer-events-none absolute top-2 left-2" /> : null}
        {/* Pista visual: la foto se puede tocar para ver el detalle. */}
        {onAbrir ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 bottom-2 inline-flex size-7 items-center justify-center rounded-full bg-surface/90 text-brand shadow-sm ring-1 ring-black/5"
          >
            <Expand className="size-3.5" />
          </span>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col border-t p-3 sm:p-4", destacado ? "border-gold/25 bg-gold-soft" : "border-line/60")}>
        {/* Alto fijo de 2 líneas: en el celular el nombre suele ocuparlas y
            así los precios quedan alineados en la fila. */}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 font-medium text-ink sm:min-h-[3rem] sm:text-base sm:leading-6">
          {nombre}
        </h3>
        <div className="mt-auto pt-2">{children}</div>
      </div>
    </article>
  );

  if (!destacado) {
    return tarjeta;
  }

  // Destacado: borde en degradé dorado (efecto metálico) y sombra dorada.
  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-strong p-[2px] shadow-md shadow-gold/25 transition duration-300 hover:shadow-lg hover:shadow-gold/40">
      {tarjeta}
    </div>
  );
}
