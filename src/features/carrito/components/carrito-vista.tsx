"use client";

import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  calcularTotal,
  cambiarCantidad,
  contarUnidades,
  quitarDelCarrito,
  useCarrito,
} from "@/features/carrito/store";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { formatPrecio } from "@/lib/format";

const botonCantidad =
  "inline-flex size-8 items-center justify-center rounded-full text-brand transition hover:bg-brand-soft disabled:opacity-40";

export function CarritoVista() {
  const items = useCarrito();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Cuando agregues productos, los vas a ver acá.</p>
        <Link
          className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/catalogo"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const unidades = contarUnidades(items);

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-brand sm:text-3xl">Tu carrito</h1>
      <p className="mt-1 text-sm text-muted">
        {unidades} {unidades === 1 ? "producto" : "productos"}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {items.map((item) => {
            const imagenUrl = productoImagenUrl(item.imagen);

            return (
              <li className="flex gap-3 p-3 sm:gap-4 sm:p-4" key={item.id}>
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line sm:size-24">
                  {imagenUrl ? (
                    <Image alt={item.nombre} className="object-cover" fill sizes="6rem" src={imagenUrl} unoptimized />
                  ) : (
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-sand via-brand-soft to-accent-soft">
                      <Heart className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-heart/40" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm leading-5 font-medium sm:text-base">{item.nombre}</p>
                      {item.variante ? <p className="mt-0.5 text-xs text-muted">{item.variante}</p> : null}
                    </div>
                    <button
                      aria-label={`Quitar ${item.nombre}`}
                      className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
                      onClick={() => quitarDelCarrito(item.id)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button
                        aria-label="Quitar una unidad"
                        className={botonCantidad}
                        disabled={item.cantidad <= 1}
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        type="button"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span aria-label="Cantidad" className="w-7 text-center text-sm font-semibold tabular-nums">
                        {item.cantidad}
                      </span>
                      <button
                        aria-label="Sumar una unidad"
                        className={botonCantidad}
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        type="button"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-brand tabular-nums">
                      {formatPrecio(Number(item.precio) * item.cantidad)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold">Total</p>
            <p className="text-2xl font-bold text-brand tabular-nums">{formatPrecio(calcularTotal(items))}</p>
          </div>
          {/* Si no hay sesión, la página manda a ingresar y vuelve. */}
          <Link
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong"
            href="/finalizar-compra"
          >
            Finalizar compra
          </Link>
          <Link
            className="mt-4 block text-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
            href="/catalogo"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </>
  );
}
