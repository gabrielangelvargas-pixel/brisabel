"use client";

import { useState } from "react";

import { ProductoDetalle, productoUrl } from "@/features/productos/components/producto-detalle";
import type { ProductoPublico } from "@/features/productos/public-queries";

type ProductoPaginaProps = {
  nombre: string;
  categoria: string;
  variacion: string | null;
  variantes: ProductoPublico[];
  indiceInicial: number;
};

// Detalle en la página propia del producto (la que se comparte). Arranca en la
// variante del enlace y, al cambiarla, actualiza la dirección sin recargar.
export function ProductoPagina({ indiceInicial, variantes, ...props }: ProductoPaginaProps) {
  const [indice, setIndice] = useState(indiceInicial);

  function avanzar() {
    const nuevo = (indice + 1) % variantes.length;
    setIndice(nuevo);
    window.history.replaceState(null, "", productoUrl(variantes[nuevo].slug));
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-xl shadow-brand/10 ring-1 ring-black/5">
      <ProductoDetalle {...props} indice={indice} onAvanzar={avanzar} variantes={variantes} />
    </div>
  );
}
