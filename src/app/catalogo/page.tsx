import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, ChevronRight } from "lucide-react";

import { appConfig } from "@/config/app";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Catalogo - ${appConfig.name}`,
  description: "Explora las categorias del catalogo de Brisabel.",
};

async function getCategories() {
  return getPrisma().categoria.findMany({
    where: {
      parentId: null,
    },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: {
      children: {
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
      _count: {
        select: {
          children: true,
          productos: true,
        },
      },
    },
  });
}

export default async function CatalogPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-5 pb-28 pt-8 text-[#1f2320] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
          Catalogo
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Explora por categoria
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#69625b]">
              Navega los rubros principales y entra a cada familia para ver sus
              subcategorias y productos publicados.
            </p>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                className="group rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c7a18a]"
                href={`/categorias/${category.slug}`}
                key={category.id}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#f2e4db] text-[#7f4f3a]">
                  <Boxes className="h-5 w-5" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{category.nombre}</h2>
                  <ChevronRight className="mt-1 h-4 w-4 text-[#98715c] transition group-hover:translate-x-1" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#98715c]">
                  {category._count.children} subcategorias / {category._count.productos} productos
                </p>

                {category.children.length > 0 ? (
                  <ul className="mt-4 grid gap-2 border-t border-[#eee5dc] pt-4 text-sm text-[#504a44]">
                    {category.children.map((child) => (
                      <li className="flex items-center gap-2" key={child.id}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c7a18a]" />
                        {child.nombre}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-[#e1d8cc] bg-white p-6 text-sm leading-6 text-[#69625b] shadow-sm">
            Todavia no hay categorias cargadas.
          </div>
        )}
      </section>
    </main>
  );
}
