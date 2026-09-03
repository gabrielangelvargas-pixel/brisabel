import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { CategoryLevelSelect } from "@/components/category-level-select";
import { appConfig, socialImageConfig } from "@/config/app";
import { getCategoryFamilyIds } from "@/lib/category-family";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CategoryPageProps = PageProps<"/categorias/[slug]">;

async function getCategory(slug: string) {
  return getPrisma().categoria.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          nombre: true,
          slug: true,
        },
      },
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

async function getProductsByCategoryFamily(categoryId: string) {
  const familyIds = await getCategoryFamilyIds(categoryId);

  return getPrisma().producto.findMany({
    where: {
      activo: true,
      categoriaId: {
        in: familyIds,
      },
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

function getCategoryDescription(category: {
  nombre: string;
  descripcion: string | null;
}) {
  return (
    category.descripcion ??
    `Mira productos de ${category.nombre} en el catalogo de ${appConfig.name}.`
  );
}

function getCategoryUrl(slug: string) {
  return new URL(`/categorias/${slug}`, appConfig.url).toString();
}

function getCategoryImageUrl(imageName: string | null) {
  if (!imageName) {
    return new URL(appConfig.image, appConfig.url).toString();
  }

  return new URL(`/media/categorias/${imageName}`, appConfig.url).toString();
}

function getCategoryImagePath(imageName: string | null) {
  if (!imageName) {
    return appConfig.image;
  }

  return `/media/categorias/${imageName}`;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: `Categoria no encontrada | ${appConfig.name}`,
    };
  }

  const title = `${category.nombre} - ${appConfig.name}`;
  const description = getCategoryDescription(category);
  const url = getCategoryUrl(category.slug);
  const imageUrl = getCategoryImageUrl(category.imagen);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: appConfig.name,
      type: "website",
      locale: "es_AR",
      images: [
        {
          url: imageUrl,
          width: socialImageConfig.width,
          height: socialImageConfig.height,
          alt: `${category.nombre} - ${appConfig.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategoryFamily(category.id);
  const imagePath = getCategoryImagePath(category.imagen);

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-24 text-[#1f2320]">
      <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-8 lg:px-10">
        <h1 className="sr-only">{category.nombre}</h1>

        <div className="overflow-hidden rounded-lg border border-[#e1d8cc] bg-white shadow-sm">
          <Image
            alt={`${category.nombre} - ${appConfig.name}`}
            className="aspect-[1200/628] h-auto w-full object-cover"
            height={socialImageConfig.height}
            preload
            src={imagePath}
            width={socialImageConfig.width}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border border-[#e1d8cc] bg-white px-3 py-2 text-sm font-semibold text-[#7f4f3a] transition hover:text-[#5f3828]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {category.parent ? (
            <Link
              className="inline-flex w-fit items-center gap-2 rounded-md border border-[#e1d8cc] bg-white px-3 py-2 text-sm font-medium text-[#69625b]"
              href={`/categorias/${category.parent.slug}`}
            >
              {category.parent.nombre}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        {category.children.length > 0 ? (
          <div className="max-w-xl">
            <CategoryLevelSelect
              currentLabel={category.nombre}
              currentSlug={category.slug}
              options={category.children.map((child) => ({
                label: child.nombre,
                slug: child.slug,
              }))}
            />
          </div>
        ) : null}

        <div className={category.children.length > 0 ? "mt-6" : ""}>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Productos</h2>
            {category.children.length > 0 ? (
              <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#98715c] sm:block">
                {category.children.length} subcategorias
              </p>
            ) : null}
          </div>

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
              Todavia no hay productos cargados en esta categoria.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
