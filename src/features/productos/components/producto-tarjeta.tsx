"use client";

import { ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";

import { AgregarAlCarrito } from "@/features/carrito/components/agregar-al-carrito";
import { BadgeDestacado, ProductoCard, ProductoImagen } from "@/features/productos/components/producto-card";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoPublico } from "@/features/productos/public-queries";
import { cn } from "@/lib/cn";
import { formatPrecio } from "@/lib/format";

type ProductoTarjetaProps = {
  nombre: string;
  categoria: string;
  // Qué varía ("Color", "Tamaño"...). null en productos sin variantes.
  variacion: string | null;
  // Una sola en productos sueltos; varias en un modelo (ya ordenadas).
  variantes: ProductoPublico[];
};

// Tarjeta de la tienda + modal de detalle. Arranca con la primera variante;
// la flecha pasa a la siguiente (y vuelve a la primera después de la última).
// La variante elegida es la misma en la tarjeta y en el modal, y el estilo
// dorado de destacado sigue a la variante que se está mostrando.
export function ProductoTarjeta({ nombre, categoria, variacion, variantes }: ProductoTarjetaProps) {
  const [indice, setIndice] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const conVariantes = variacion !== null && variantes.length > 1;
  const elegida = variantes[indice];
  const destacado = elegida.destacado;
  const siguiente = variantes[(indice + 1) % variantes.length];
  const avanzar = () => setIndice((i) => (i + 1) % variantes.length);
  const imagenUrl = productoImagenUrl(elegida.imagen);

  const botonSiguiente = conVariantes ? (
    <button
      aria-label={`Ver siguiente ${variacion.toLowerCase()}: ${siguiente.variante}`}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition",
        destacado
          ? "border-gold/40 text-gold-strong hover:bg-gold/15"
          : "border-line text-brand hover:border-brand/40 hover:bg-brand-soft",
      )}
      onClick={avanzar}
      title={`Siguiente: ${siguiente.variante}`}
      type="button"
    >
      <ChevronRight className="size-4" />
    </button>
  ) : null;

  return (
    <>
      <ProductoCard destacado={destacado} imagenUrl={imagenUrl} nombre={nombre} onAbrir={() => dialogRef.current?.showModal()}>
        {/* Línea de variante de alto fijo (vacía si no hay) para alinear precios. */}
        {/* El contador (1/4) avisa que hay más opciones para ver con la flecha. */}
        <p className="flex h-4 items-center justify-between gap-2 text-xs leading-4 text-muted">
          {conVariantes ? (
            <>
              <span className="truncate">
                {variacion}: <span className="font-semibold text-ink">{elegida.variante}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                {indice + 1}/{variantes.length}
              </span>
            </>
          ) : null}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className={cn("text-lg font-bold tabular-nums sm:text-xl", destacado ? "text-gold-strong" : "text-brand")}>
            {formatPrecio(elegida.precioVenta)}
          </p>
          {botonSiguiente}
        </div>
      </ProductoCard>

      <dialog
        aria-label={nombre}
        className="m-auto max-h-[92dvh] w-[min(92vw,56rem)] overflow-y-auto rounded-2xl bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50"
        onClick={(event) => {
          // Un click fuera del panel cae sobre el propio <dialog> (el fondo).
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        ref={dialogRef}
      >
        {/* Celular: vertical (imagen arriba). Tablet y escritorio: horizontal. */}
        <div className="relative grid md:grid-cols-2">
          <div className="relative aspect-square bg-white">
            <ProductoImagen imagenUrl={imagenUrl} nombre={nombre} sizes="(min-width: 768px) 28rem, 92vw" />
            {destacado ? <BadgeDestacado className="absolute top-3 left-3" /> : null}
          </div>

          <div className="flex flex-col gap-5 p-5 sm:p-8">
            <div className="pr-10">
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{categoria}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight font-semibold text-brand sm:text-3xl">{nombre}</h2>
            </div>

            {conVariantes ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">
                    {variacion}: <span className="font-semibold">{elegida.variante}</span>
                  </p>
                  {botonSiguiente}
                </div>
                <div aria-label={variacion} className="mt-3 flex flex-wrap gap-2" role="group">
                  {variantes.map((variante, i) => (
                    <button
                      aria-pressed={i === indice}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        i === indice
                          ? destacado
                            ? "border-gold-strong bg-gold-strong text-white"
                            : "border-brand bg-brand text-white"
                          : "border-line bg-surface hover:border-brand/40",
                      )}
                      key={variante.id}
                      onClick={() => setIndice(i)}
                      type="button"
                    >
                      {variante.variante}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto border-t border-line pt-5">
              <p className={cn("text-3xl font-bold tabular-nums", destacado ? "text-gold-strong" : "text-brand")}>
                {formatPrecio(elegida.precioVenta)}
              </p>
              <p className="mt-1 text-xs text-muted">Código: {elegida.sku}</p>
              <div className="mt-5">
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

          <button
            aria-label="Cerrar"
            className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-surface/95 text-ink shadow-md ring-1 ring-black/5 transition hover:bg-brand-soft"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>
      </dialog>
    </>
  );
}
