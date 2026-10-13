"use client";

import { Minus, Plus } from "lucide-react";

import { agregarAlCarrito, cambiarCantidad, type ItemCarrito, useCarrito } from "@/features/carrito/store";
import { cn } from "@/lib/cn";

// Control del carrito en el detalle: [ – | cantidad | + ] en tres partes
// iguales. La cantidad es la que ya hay de este producto en el carrito; con
// "–" en 1 se quita del carrito.
export function AgregarAlCarrito({ item, destacado }: { item: Omit<ItemCarrito, "cantidad">; destacado: boolean }) {
  const cantidad = useCarrito().find((i) => i.id === item.id)?.cantidad ?? 0;

  const boton = cn(
    "inline-flex items-center justify-center text-white transition disabled:opacity-50",
    destacado ? "bg-gold-strong enabled:hover:brightness-110" : "bg-brand enabled:hover:bg-brand-strong",
  );

  return (
    <div
      aria-label="Cantidad en el carrito"
      className={cn(
        "grid h-12 grid-cols-3 overflow-hidden rounded-full border-2 shadow-sm",
        destacado ? "border-gold-strong" : "border-brand",
      )}
      role="group"
    >
      <button
        aria-label="Quitar una unidad del carrito"
        className={boton}
        disabled={cantidad === 0}
        onClick={() => cambiarCantidad(item.id, cantidad - 1)}
        type="button"
      >
        <Minus className="size-5" />
      </button>
      <output
        aria-live="polite"
        className={cn(
          "flex items-center justify-center bg-surface text-lg font-bold tabular-nums",
          destacado ? "text-gold-strong" : "text-brand",
        )}
      >
        {cantidad}
      </output>
      <button
        aria-label="Agregar una unidad al carrito"
        className={boton}
        onClick={() => agregarAlCarrito(item)}
        type="button"
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}
