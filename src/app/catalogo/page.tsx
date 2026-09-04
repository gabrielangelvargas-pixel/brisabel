import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

import { appConfig, socialImageConfig } from "@/config/app";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Catalogo - ${appConfig.name}`,
  description: "Explora las categorias del catalogo de Brisabel.",
};

type CatalogCategory = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen: string | null;
  updatedAt: Date;
  parentId: string | null;
  _count: {
    children: number;
    productos: number;
  };
};

type CategoryGroups = Map<string | null, CatalogCategory[]>;

function getCategoryImagePath(category: CatalogCategory) {
  if (!category.imagen) {
    return appConfig.image;
  }

  return `/media/categorias/version/${category.updatedAt.getTime()}/${category.imagen}`;
}

function getCategoryStats(category: CatalogCategory) {
  const parts = [];

  if (category._count.children > 0) {
    parts.push(
      `${category._count.children} ${
        category._count.children === 1 ? "subcategoria" : "subcategorias"
      }`,
    );
  }

  if (category._count.productos > 0) {
    parts.push(
      `${category._count.productos} ${
        category._count.productos === 1 ? "producto" : "productos"
      }`,
    );
  }

  return parts.join(" / ");
}

async function getCategories() {
  return getPrisma().categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
      imagen: true,
      updatedAt: true,
      parentId: true,
      _count: {
        select: {
          children: true,
          productos: true,
        },
      },
    },
  });
}

function groupCategoriesByParent(categories: CatalogCategory[]) {
  return categories.reduce<CategoryGroups>((groups, category) => {
    const siblings = groups.get(category.parentId) ?? [];
    siblings.push(category);
    groups.set(category.parentId, siblings);
    return groups;
  }, new Map());
}

function CategoryImage({
  category,
  preload = false,
}: {
  category: CatalogCategory;
  preload?: boolean;
}) {
  return (
    <Image
      alt={`${category.nombre} - ${appConfig.name}`}
      className="aspect-[1200/628] h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      height={socialImageConfig.height}
      preload={preload}
      src={getCategoryImagePath(category)}
      width={socialImageConfig.width}
    />
  );
}

function CategoryCard({
  category,
  featured = false,
  preload = false,
}: {
  category: CatalogCategory;
  featured?: boolean;
  preload?: boolean;
}) {
  const stats = getCategoryStats(category);

  return (
    <Link
      className={`group block overflow-hidden rounded-lg border border-[#e1d8cc] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9aa98] hover:shadow-md ${
        featured ? "min-h-full" : ""
      }`}
      href={`/categorias/${category.slug}`}
    >
      <div className="overflow-hidden bg-[#f5eee8]">
        <CategoryImage category={category} preload={preload} />
      </div>
      <div className={featured ? "p-4 sm:p-5" : "p-3 sm:p-4"}>
        <div className="flex items-start justify-between gap-3">
          <h2
            className={
              featured
                ? "text-lg font-semibold leading-snug"
                : "text-base font-semibold leading-snug"
            }
          >
            {category.nombre}
          </h2>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#98715c] transition group-hover:translate-x-1" />
        </div>

        {category.descripcion ? (
          <p className="mt-2 text-sm leading-6 text-[#69625b]">
            {category.descripcion}
          </p>
        ) : null}

        {stats ? (
          <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#98715c]">
            {stats}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CategoryRail({
  categories,
  parent,
}: {
  categories: CatalogCategory[];
  parent: CatalogCategory;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98715c]">
            {parent.nombre}
          </p>
          <h2 className="text-xl font-semibold text-[#1f2320]">
            Subcategorias
          </h2>
        </div>
        <Link
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#7f4f3a] hover:text-[#5f3828]"
          href={`/categorias/${parent.slug}`}
        >
          Ver todo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <div
            className="min-w-[72%] max-w-[18rem] flex-[0_0_72%] snap-start sm:min-w-0 sm:flex-[0_0_18rem]"
            key={category.id}
          >
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryFamilySections({
  categories,
  groups,
}: {
  categories: CatalogCategory[];
  groups: CategoryGroups;
}) {
  return (
    <>
      {categories.map((category) => {
        const children = groups.get(category.id) ?? [];

        if (children.length === 0) {
          return null;
        }

        return (
          <div className="space-y-7" key={category.id}>
            <CategoryRail categories={children} parent={category} />
            <CategoryFamilySections categories={children} groups={groups} />
          </div>
        );
      })}
    </>
  );
}

export default async function CatalogPage() {
  const categories = await getCategories();
  const groups = groupCategoriesByParent(categories);
  const parentCategories = groups.get(null) ?? [];

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-24 text-[#1f2320]">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="flex items-center gap-3 text-[#7f4f3a]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2e4db]">
            <Layers3 className="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            Catalogo
          </p>
        </div>

        <div className="mt-4 max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Elegi por categoria
          </h1>
          <p className="mt-3 text-base leading-7 text-[#69625b]">
            Rubros principales y familias de productos de Brisabel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        {parentCategories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {parentCategories.map((category, index) => (
              <CategoryCard
                category={category}
                featured
                key={category.id}
                preload={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#e1d8cc] bg-white p-6 text-sm leading-6 text-[#69625b] shadow-sm">
            Todavia no hay categorias cargadas.
          </div>
        )}
      </section>

      {parentCategories.length > 0 ? (
        <section className="mx-auto max-w-7xl space-y-9 px-5 pb-14 sm:px-8 lg:px-10">
          <CategoryFamilySections
            categories={parentCategories}
            groups={groups}
          />
        </section>
      ) : null}
    </main>
  );
}
