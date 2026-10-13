"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { contarUnidades, useCarrito } from "@/features/carrito/store";

// Ícono del carrito en el navbar, con la cantidad de unidades.
export function CarritoIcono({ className }: { className: string }) {
  const unidades = contarUnidades(useCarrito());

  return (
    <Link
      aria-label={unidades > 0 ? `Carrito (${unidades} ${unidades === 1 ? "producto" : "productos"})` : "Carrito"}
      className={`relative ${className}`}
      href="/carrito"
    >
      <ShoppingBag className="size-6" />
      {unidades > 0 ? (
        <span className="absolute top-0.5 right-0 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] leading-none font-bold text-white tabular-nums ring-2 ring-surface">
          {unidades > 99 ? "99+" : unidades}
        </span>
      ) : null}
    </Link>
  );
}
