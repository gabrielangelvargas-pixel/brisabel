import type { Metadata } from "next";
import Image from "next/image";

import { CategoryLevelSelect } from "@/components/category-level-select";
import { appConfig, socialImageConfig } from "@/config/app";
import { getCategoryFamilyIds } from "@/lib/category-family";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Catalogo - ${appConfig.name}`,
  description: "Explora las categorias del catalogo de Brisabel.",
};

type CatalogPageProps = PageProps<"/catalogo">;

function getCategoryImagePath(imageName: string | null) {
  if (!imageName) {
    return appConfig.image;
  }

  return `/media/categorias/${imageName}`;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

async function getParentCategories() {
  return getPrisma().categoria.findMany({
    where: {
      parentId: null,
    },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  });
}

async function getSelectedCategory(slug: string | undefined) {
  if (!slug) {
    return null;
  }

  return getPrisma().categoria.findUnique({
    where: {
      slug,
    },
    include: {
      children: {
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
    },
  });
}

async function getProducts(categoryId: string | null) {
  const categoryIds = categoryId ? await getCategoryFamilyIds(categoryId) : null;

  return getPrisma().producto.findMany({
    where: {
      activo: true,
      ...(categoryIds
        ? {
            categoriaId: {
              in: categoryIds,
            },
          }
        : {}),
    },
    orderBy: [{ descripcion: "asc" }],
    select: {
      id: true,
      codigo: true,
      descripcion: true,
      precioVenta: true,
      imagen: true,
    },
  });
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const selectedSlug = getSingleSearchParam((await searchParams).categoria);
  const [parentCategories, selectedCategory] = await Promise.all([
    getParentCategories(),
    getSelectedCategory(selectedSlug),
  ]);
  const products = await getProducts(selectedCategory?.id ?? null);
  const selectorCategories = selectedCategory
    ? selectedCategory.children
    : parentCategories;
  const imagePath = getCategoryImagePath(selectedCategory?.imagen ?? null);

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-24 text-[#1f2320]">
      <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-8 lg:px-10">
        <h1 className="sr-only">
          {selectedCategory ? selectedCategory.nombre : "Catalogo"}
        </h1>

        <div className="overflow-hidden rounded-lg border border-[#e1d8cc] bg-white shadow-sm">
          <Image
            alt={
              selectedCategory
                ? `${selectedCategory.nombre} - ${appConfig.name}`
                : `${appConfig.name} catalogo`
            }
            className="aspect-[1200/628] h-auto w-full object-cover"
            height={socialImageConfig.height}
            preload
            src={imagePath}
            width={socialImageConfig.width}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        {selectedCategory || selectorCategories.length > 0 ? (
          <div className="max-w-xl">
            <CategoryLevelSelect
              currentLabel={selectedCategory?.nombre}
              currentSlug={selectedCategory?.slug}
              options={selectorCategories.map((category) => ({
                label: category.nombre,
                slug: category.slug,
              }))}
            />
          </div>
        ) : null}

        <div
          className={
            selectedCategory || selectorCategories.length > 0 ? "mt-6" : ""
          }
        >
          <h2 className="text-2xl font-semibold">Productos</h2>

          {products.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm"
                  key={product.id}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98715c]">
                    {product.codigo}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{product.descripcion}</h3>
                  <p className="mt-4 text-xl font-semibold">
                    ${product.precioVenta.toString()}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-[#e1d8cc] bg-white p-6 text-sm leading-6 text-[#69625b] shadow-sm">
              Todavia no hay productos cargados.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
