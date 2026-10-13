import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { IMAGEN_PROPORCION } from "@/features/categorias/imagen-size";
import { categoriaImagenUrl } from "@/features/categorias/tree";
import { cn } from "@/lib/cn";

type CategoriaTarjeta = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen: string | null;
};

// Mosaico de categorías del catálogo público (Home y /catalogo). En miniatura
// (subcategorías dentro de una categoría): más chicas, con la proporción de la
// imagen (1.91:1) y solo el nombre.
export function CategoriaGrid({ categorias, miniatura = false }: { categorias: CategoriaTarjeta[]; miniatura?: boolean }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2",
        miniatura ? "gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" : "gap-3 sm:gap-5 lg:grid-cols-3",
      )}
    >
      {categorias.map((categoria) => {
        const imagenUrl = categoriaImagenUrl(categoria.imagen);

        return (
          <li key={categoria.id}>
            <Link
              className={cn(
                "group relative block overflow-hidden bg-sand ring-1 ring-black/5",
                miniatura ? "rounded-xl" : "aspect-[4/5] rounded-2xl sm:aspect-[5/4] lg:aspect-[4/3]",
              )}
              href={`/catalogo/${categoria.slug}`}
              style={miniatura ? IMAGEN_PROPORCION : undefined}
            >
              {imagenUrl ? (
                // Ya viene optimizada (WebP) desde el panel.
                <Image
                  alt=""
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  fill
                  sizes={miniatura ? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" : "(min-width: 1024px) 33vw, 50vw"}
                  src={imagenUrl}
                  unoptimized
                />
              ) : (
                <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-sand via-brand-soft to-accent-soft">
                  <Heart className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 text-heart/40", miniatura ? "size-8" : "size-16")} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-strong/85 via-brand-strong/25 to-transparent" />
              {miniatura ? (
                <h3 className="absolute inset-x-0 bottom-0 truncate p-2.5 font-display text-sm leading-tight font-semibold text-white sm:p-3 sm:text-base">
                  {categoria.nombre}
                </h3>
              ) : (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg leading-tight font-semibold text-white sm:text-2xl">
                      {categoria.nombre}
                    </h3>
                    {categoria.descripcion ? (
                      <p className="mt-1 line-clamp-2 hidden text-sm text-white/80 sm:block">{categoria.descripcion}</p>
                    ) : null}
                  </div>
                  <span className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-brand transition group-hover:bg-white sm:inline-flex">
                    <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoriaGridSkeleton({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <li className="aspect-[4/5] animate-pulse rounded-2xl bg-sand sm:aspect-[5/4] lg:aspect-[4/3]" key={i} />
      ))}
    </ul>
  );
}
