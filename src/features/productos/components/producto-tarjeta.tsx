"use client";

import { useRef, useState } from "react";

import { ProductoCard } from "@/features/productos/components/producto-card";
import { BotonSiguiente, ProductoDetalle } from "@/features/productos/components/producto-detalle";
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
  const avanzar = () => setIndice((i) => (i + 1) % variantes.length);

  return (
    <>
      <ProductoCard
        destacado={destacado}
        imagenUrl={productoImagenUrl(elegida.imagen)}
        nombre={nombre}
        onAbrir={() => dialogRef.current?.showModal()}
      >
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
          {conVariantes ? (
            <BotonSiguiente
              onClick={avanzar}
              siguiente={variantes[(indice + 1) % variantes.length]}
              variacion={variacion}
            />
          ) : null}
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
        <ProductoDetalle
          categoria={categoria}
          indice={indice}
          nombre={nombre}
          onAvanzar={avanzar}
          onCerrar={() => dialogRef.current?.close()}
          variacion={variacion}
          variantes={variantes}
        />
      </dialog>
    </>
  );
}
