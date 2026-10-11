import { Heart, Sparkles } from "lucide-react";
import Image from "next/image";

import { productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoPublico } from "@/features/productos/public-queries";
import { formatPrecio } from "@/lib/format";

// Grilla de productos de la tienda. Todavía sin enlace: la página de
// detalle de producto se agrega en un paso siguiente.
export function ProductoGrid({ productos }: { productos: ProductoPublico[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {productos.map((producto) => (
        <li key={producto.id}>
          <ProductoCard producto={producto} />
        </li>
      ))}
    </ul>
  );
}

function ProductoCard({ producto }: { producto: ProductoPublico }) {
  const imagenUrl = productoImagenUrl(producto.imagen);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand/15 hover:shadow-lg hover:shadow-brand/10">
      <div className="relative aspect-square overflow-hidden bg-white">
        {imagenUrl ? (
          <Image
            alt={producto.nombre}
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
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

        {producto.destacado ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-sm">
            <Sparkles className="size-3" />
            Destacado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-line/60 p-3 sm:p-4">
        {/* Alto fijo de 2 líneas: los precios quedan alineados en la fila. */}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 font-medium text-ink sm:min-h-[3rem] sm:text-base sm:leading-6">
          {producto.nombre}
        </h3>
        <p className="mt-auto text-lg font-bold text-brand tabular-nums sm:text-xl">
          {formatPrecio(producto.precioVenta)}
        </p>
      </div>
    </article>
  );
}
