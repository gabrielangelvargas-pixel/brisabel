"use client";

import { useState } from "react";

import { precioDelModelo, type TarjetaTienda } from "@/features/productos/agrupar-tienda";
import { ProductoCard } from "@/features/productos/components/producto-card";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { cn } from "@/lib/cn";
import { formatPrecio } from "@/lib/format";

type Modelo = Extract<TarjetaTienda, { tipo: "modelo" }>;

// Tarjeta de un modelo con variantes: botones para elegir la variante, que
// cambian foto y precio. Antes de elegir: foto de la primera y "Desde $X"
// si los precios difieren.
export function ModeloCard({ modelo }: { modelo: Modelo }) {
  const [elegidaId, setElegidaId] = useState<number | null>(null);
  const elegida = modelo.variantes.find((v) => v.id === elegidaId) ?? null;
  const mostrada = elegida ?? modelo.variantes.find((v) => v.imagen) ?? modelo.variantes[0];
  const { minimo, desde } = precioDelModelo(modelo.variantes);

  const precio = elegida ? (
    formatPrecio(elegida.precioVenta)
  ) : desde ? (
    <>
      <span className="text-xs font-semibold tracking-wide uppercase opacity-70">Desde </span>
      {formatPrecio(minimo)}
    </>
  ) : (
    formatPrecio(minimo)
  );

  return (
    <ProductoCard
      destacado={modelo.destacado}
      imagenUrl={productoImagenUrl(mostrada.imagen)}
      nombre={modelo.nombre}
      precio={precio}
    >
      <div aria-label={modelo.variacion} className="flex flex-wrap gap-1.5" role="group">
        {modelo.variantes.map((variante) => {
          const activa = variante.id === elegidaId;

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
              onClick={() => setElegidaId(activa ? null : variante.id)}
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
