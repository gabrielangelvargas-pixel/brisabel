"use client";

import { ChevronRight, X } from "lucide-react";

import { ShareButton } from "@/components/ui/share-button";
import { siteConfig } from "@/config/site";
import { AgregarAlCarrito } from "@/features/carrito/components/agregar-al-carrito";
import { BadgeDestacado, ProductoImagen } from "@/features/productos/components/producto-card";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoPublico } from "@/features/productos/public-queries";
import { cn } from "@/lib/cn";
import { formatPrecio } from "@/lib/format";

export function productoUrl(slug: string) {
  return `/producto/${slug}`;
}

// Botón "siguiente variante" (vuelve a la primera después de la última).
export function BotonSiguiente({
  variacion,
  siguiente,
  destacado,
  onClick,
}: {
  variacion: string;
  siguiente: ProductoPublico;
  destacado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`Ver siguiente ${variacion.toLowerCase()}: ${siguiente.variante}`}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition",
        destacado
          ? "border-gold/40 text-gold-strong hover:bg-gold/15"
          : "border-line text-brand hover:border-brand/40 hover:bg-brand-soft",
      )}
      onClick={onClick}
      title={`Siguiente: ${siguiente.variante}`}
      type="button"
    >
      <ChevronRight className="size-4" />
    </button>
  );
}

type ProductoDetalleProps = {
  nombre: string;
  categoria: string;
  variacion: string | null;
  variantes: ProductoPublico[];
  indice: number;
  onAvanzar: () => void;
  // Solo en el modal.
  onCerrar?: () => void;
};

// Detalle de un producto: en el modal de la tienda y en /producto/[slug].
// Celular: vertical (imagen arriba). Tablet y escritorio: horizontal.
export function ProductoDetalle({ nombre, categoria, variacion, variantes, indice, onAvanzar, onCerrar }: ProductoDetalleProps) {
  const conVariantes = variacion !== null && variantes.length > 1;
  const elegida = variantes[indice];
  const destacado = elegida.destacado;
  const imagenUrl = productoImagenUrl(elegida.imagen);
  const nombreCompleto = conVariantes ? `${nombre} (${elegida.variante})` : nombre;

  return (
    <div className="relative grid md:grid-cols-2">
      <div className="relative aspect-square bg-white">
        <ProductoImagen imagenUrl={imagenUrl} nombre={nombre} sizes="(min-width: 768px) 28rem, 92vw" />
        {/* Comparte la variante que se está viendo. */}
        <ShareButton
          className="absolute top-3 left-3"
          text={`${nombreCompleto} en ${siteConfig.name}`}
          title={nombreCompleto}
          url={productoUrl(elegida.slug)}
          variant="icon"
        />
        {destacado ? <BadgeDestacado className="absolute bottom-3 left-3" /> : null}
      </div>

      <div className="flex flex-col gap-3 p-5 sm:gap-4 sm:p-8">
        <div className={onCerrar ? "pr-10 md:pr-8" : undefined}>
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{categoria}</p>
          <h2 className="mt-2 font-display text-2xl leading-tight font-semibold text-brand sm:text-3xl">{nombre}</h2>
        </div>

        {conVariantes ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">
              {variacion}: <span className="font-semibold">{elegida.variante}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted tabular-nums">
                {indice + 1}/{variantes.length}
              </span>
              <BotonSiguiente
                destacado={destacado}
                onClick={onAvanzar}
                siguiente={variantes[(indice + 1) % variantes.length]}
                variacion={variacion}
              />
            </div>
          </div>
        ) : null}

        {/* Código a la izquierda y precio a la derecha, en una sola línea. */}
        <div className="mt-auto border-t border-line pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-muted">Código: {elegida.sku}</p>
            <p className={cn("text-3xl font-bold tabular-nums", destacado ? "text-gold-strong" : "text-brand")}>
              {formatPrecio(elegida.precioVenta)}
            </p>
          </div>
          <div className="mt-3">
            <AgregarAlCarrito
              destacado={destacado}
              item={{
                id: elegida.id,
                sku: elegida.sku,
                nombre,
                variante: conVariantes ? `${variacion}: ${elegida.variante}` : null,
                precio: elegida.precioVenta,
                imagen: elegida.imagen,
              }}
            />
          </div>
        </div>
      </div>

      {onCerrar ? (
        <button
          aria-label="Cerrar"
          className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-neutral-800/90 text-white shadow-md transition hover:bg-neutral-900"
          onClick={onCerrar}
          type="button"
        >
          <X className="size-5" />
        </button>
      ) : null}
    </div>
  );
}
