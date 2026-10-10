import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <ShoppingBag className="size-8" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">Tu carrito está vacío</h1>
      <p className="mt-2 text-muted">Cuando agregues productos, los vas a ver acá.</p>
      <Link
        className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        href="/"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
