import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes, ChevronRight, Tag } from "lucide-react";

import { appConfig } from "@/config/app";
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
          descripcion: true,
          imagen: true,
          _count: {
            select: {
              children: true,
              productos: true,
            },
          },
        },
      },
      productos: {
        orderBy: [{ descripcion: "asc" }],
        select: {
          id: true,
          codigo: true,
          descripcion: true,
          precioVenta: true,
          imagen: true,
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
          width: 1200,
          height: 1200,
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

  const description = getCategoryDescription(category);
  const imagePath = getCategoryImagePath(category.imagen);

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-24 text-[#1f2320]">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-12">
        <div className="order-2 flex flex-col justify-center lg:order-1">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#7f4f3a] transition hover:text-[#5f3828]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {category.parent ? (
            <Link
              className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-[#e1d8cc] bg-white px-3 py-2 text-sm font-medium text-[#69625b]"
              href={`/categorias/${category.parent.slug}`}
            >
              {category.parent.nombre}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
            Categoria
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            {category.nombre}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#69625b] sm:text-lg">
            {description}
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#e1d8cc] bg-white p-4">
              <Tag className="h-5 w-5 text-[#7f4f3a]" />
              <p className="mt-3 text-2xl font-semibold">{category._count.children}</p>
              <p className="text-sm text-[#69625b]">Subcategorias</p>
            </div>
            <div className="rounded-lg border border-[#e1d8cc] bg-white p-4">
              <Boxes className="h-5 w-5 text-[#7f4f3a]" />
              <p className="mt-3 text-2xl font-semibold">{category._count.productos}</p>
              <p className="text-sm text-[#69625b]">Productos</p>
            </div>
          </div>
        </div>

        <div className="order-1 overflow-hidden rounded-lg border border-[#e1d8cc] bg-white shadow-sm lg:order-2">
          <Image
            alt={`${category.nombre} - ${appConfig.name}`}
            className="aspect-square h-auto w-full object-cover"
            height={1200}
            priority
            src={imagePath}
            width={1200}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        {category.children.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold">Subcategorias</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.children.map((child) => (
                <Link
                  className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c7a18a]"
                  href={`/categorias/${child.slug}`}
                  key={child.id}
                >
                  {child.imagen ? (
                    <Image
                      alt={`${child.nombre} - ${appConfig.name}`}
                      className="mb-4 aspect-square w-full rounded-md object-cover"
                      height={600}
                      src={`/media/categorias/${child.imagen}`}
                      width={600}
                    />
                  ) : null}
                  <h3 className="text-lg font-semibold">{child.nombre}</h3>
                  {child.descripcion ? (
                    <p className="mt-2 text-sm leading-6 text-[#69625b]">
                      {child.descripcion}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#98715c]">
                    {child._count.children} hijas / {child._count.productos} productos
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className={category.children.length > 0 ? "mt-12" : ""}>
          <h2 className="text-2xl font-semibold">Productos</h2>
          {category.productos.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.productos.map((product) => (
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
