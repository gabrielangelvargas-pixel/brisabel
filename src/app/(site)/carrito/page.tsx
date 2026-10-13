import type { Metadata } from "next";

import { CarritoVista } from "@/features/carrito/components/carrito-vista";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:py-12">
      <CarritoVista />
    </main>
  );
}
