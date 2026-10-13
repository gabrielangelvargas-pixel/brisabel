"use client";

import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { agregarAlCarrito, type ItemCarrito } from "@/features/carrito/store";
import { cn } from "@/lib/cn";

// Botón "Agregar al carrito". Al tocarlo confirma por un momento y ofrece ir
// al carrito; tocarlo de nuevo suma otra unidad.
export function AgregarAlCarrito({ item, destacado }: { item: Omit<ItemCarrito, "cantidad">; destacado: boolean }) {
  // Id del último agregado: si se cambia de variante, el aviso no se muestra.
  const [agregadoId, setAgregadoId] = useState<number | null>(null);
  const agregado = agregadoId === item.id;

  useEffect(() => {
    if (agregadoId === null) return;
    const timer = setTimeout(() => setAgregadoId(null), 2500);
    return () => clearTimeout(timer);
  }, [agregadoId]);

  return (
    <div className="grid gap-2">
      <button
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-white shadow-sm transition",
          destacado ? "bg-gold-strong hover:brightness-110" : "bg-brand hover:bg-brand-strong",
        )}
        onClick={() => {
          agregarAlCarrito(item);
          setAgregadoId(item.id);
        }}
        type="button"
      >
        {agregado ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
        {agregado ? "¡Agregado al carrito!" : "Agregar al carrito"}
      </button>
      <p aria-live="polite" className="h-5 text-center text-sm">
        {agregado ? (
          <Link className="font-semibold text-accent underline-offset-4 hover:underline" href="/carrito">
            Ver carrito
          </Link>
        ) : null}
      </p>
    </div>
  );
}
