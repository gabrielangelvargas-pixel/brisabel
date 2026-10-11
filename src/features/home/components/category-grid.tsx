import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homeCategories } from "@/features/home/content";

// Mosaico de categorías con foto. Se usa en la Home y en el catálogo.
export function CategoryGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {homeCategories.map((category) => (
        <li key={category.nombre}>
          <Link
            className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand ring-1 ring-black/5 sm:aspect-[5/4] lg:aspect-[4/3]"
            href={category.href}
          >
            <Image
              alt=""
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 33vw, 50vw"
              src={category.imagen}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-strong/85 via-brand-strong/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
              <div>
                <h3 className="font-display text-lg leading-tight font-semibold text-white sm:text-2xl">
                  {category.nombre}
                </h3>
                <p className="mt-1 hidden text-sm text-white/80 sm:block">{category.descripcion}</p>
              </div>
              <span className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-brand transition group-hover:bg-white sm:inline-flex">
                <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
