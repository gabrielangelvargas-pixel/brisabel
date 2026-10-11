import { Heart } from "lucide-react";
import Image from "next/image";

import { productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoPublico } from "@/features/productos/public-queries";
import { formatPrecio } from "@/lib/format";

// Grilla de productos de la tienda. Todavía sin enlace: la página de
// detalle de producto se agrega en un paso siguiente.
export function ProductoGrid({ productos }: { productos: ProductoPublico[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {productos.map((producto) => {
        const imagenUrl = productoImagenUrl(producto.imagen);

        return (
          <li key={producto.id}>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-sand ring-1 ring-black/5">
              {imagenUrl ? (
                <Image
                  alt={producto.nombre}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  src={imagenUrl}
                  unoptimized
                />
              ) : (
                <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-sand via-brand-soft to-accent-soft">
                  <Heart className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-heart/40" />
                </div>
              )}
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm leading-snug font-medium text-ink sm:text-base">{producto.nombre}</h3>
            <p className="mt-1 text-base font-semibold text-brand sm:text-lg">{formatPrecio(producto.precioVenta)}</p>
          </li>
        );
      })}
    </ul>
  );
}
