"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import type { TarjetaTienda } from "@/features/productos/agrupar-tienda";
import { ProductoCard } from "@/features/productos/components/producto-card";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { cn } from "@/lib/cn";
import { formatPrecio } from "@/lib/format";

type Modelo = Extract<TarjetaTienda, { tipo: "modelo" }>;

// Tarjeta de un modelo con variantes. Arranca con la primera variante (según
// el orden cargado) elegida; los botones y la flecha junto al precio cambian
// de variante, y con ella la foto y el precio.
export function ModeloCard({ modelo }: { modelo: Modelo }) {
  const [indice, setIndice] = useState(0);
  const variantes = modelo.variantes;
  const elegida = variantes[indice];
  const siguiente = variantes[(indice + 1) % variantes.length];

  const precio = (
    <span className="flex items-center justify-between gap-2">
      {formatPrecio(elegida.precioVenta)}
      <button
        aria-label={`Ver siguiente ${modelo.variacion.toLowerCase()}: ${siguiente.variante}`}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition",
          modelo.destacado
            ? "border-gold/40 text-gold-strong hover:bg-gold/15"
            : "border-line text-brand hover:border-brand/40 hover:bg-brand-soft",
        )}
        onClick={() => setIndice((i) => (i + 1) % variantes.length)}
        title={`Siguiente: ${siguiente.variante}`}
        type="button"
      >
        <ChevronRight className="size-4" />
      </button>
    </span>
  );

  return (
    <ProductoCard
      destacado={modelo.destacado}
      imagenUrl={productoImagenUrl(elegida.imagen)}
      nombre={modelo.nombre}
      precio={precio}
    >
      <div aria-label={modelo.variacion} className="flex flex-wrap gap-1.5" role="group">
        {variantes.map((variante, i) => {
          const activa = i === indice;

          return (
            <button
              aria-pressed={activa}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                activa
                  ? modelo.destacado
                    ? "border-gold-strong bg-gold-strong text-white"
                    : "border-brand bg-brand text-white"
                  : "border-line bg-surface text-ink hover:border-brand/40",
              )}
              key={variante.id}
              onClick={() => setIndice(i)}
              title={`${modelo.variacion}: ${variante.variante}`}
              type="button"
            >
              {variante.variante}
            </button>
          );
        })}
      </div>
    </ProductoCard>
  );
}
