import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gem,
  Gift,
  Headphones,
  Heart,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";

import { appConfig } from "@/config/app";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categoryStyles = {
  "acero-quirurgico": {
    icon: Sparkles,
    summary: "Piezas resistentes, faciles de combinar y pensadas para uso diario.",
  },
  electronica: {
    icon: Headphones,
    summary: "Accesorios practicos y tecnologia compacta para regalar o renovar.",
  },
  marroquineria: {
    icon: ShoppingBag,
    summary: "Carteras, billeteras y complementos para organizar la rutina.",
  },
  "plata-900-925": {
    icon: Gem,
    summary: "Joyas en plata con brillo clasico para ocasiones especiales.",
  },
};

type HomeCategory = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  children: Array<{
    id: string;
    nombre: string;
  }>;
  _count: {
    children: number;
    productos: number;
  };
};

const featuredProducts = [
  "Sets de regalo",
  "Accesorios de moda",
  "Organizadores",
  "Cuidado personal",
];

const benefits = [
  { label: "Seleccion variada", icon: Gift },
  { label: "Compra simple", icon: WalletCards },
  { label: "Productos cuidados", icon: ShieldCheck },
  { label: "Envios coordinados", icon: Truck },
];

async function getHomeCategories(): Promise<{
  categories: HomeCategory[];
  hasError: boolean;
}> {
  try {
    const prisma = getPrisma();

    const categories = await prisma.categoria.findMany({
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

    return { categories, hasError: false };
  } catch (error) {
    console.error("No se pudieron cargar las categorias", error);
    return { categories: [], hasError: true };
  }
}

export default async function Home() {
  const { categories, hasError } = await getHomeCategories();

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#1f2320]">
      <header className="border-b border-[#e6ded3] bg-[#fbfaf8]/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#7f4f3a] text-white">
              <Heart className="h-5 w-5" />
            </span>
            <span className="text-xl font-semibold tracking-wide">{appConfig.name}</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#5f5a55] md:flex">
            <a className="transition hover:text-[#7f4f3a]" href="#categorias">
              Categorias
            </a>
            <a className="transition hover:text-[#7f4f3a]" href="#destacados">
              Destacados
            </a>
            <a className="transition hover:text-[#7f4f3a]" href="#contacto">
              Contacto
            </a>
          </div>
          <a
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1f2320] px-4 text-sm font-medium text-white transition hover:bg-[#39423b]"
            href="#destacados"
          >
            Ver productos
            <ArrowRight className="h-4 w-4" />
          </a>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-16">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
            Tienda multiproducto
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[#1f2320] sm:text-6xl">
            Cosas lindas, utiles y listas para regalar.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#69625b]">
            En BrisaBel reunimos bijouterie, marroquineria, cosmetica,
            electronica y accesorios seleccionados para resolver compras de
            todos los dias con estilo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#7f4f3a] px-5 text-sm font-semibold text-white transition hover:bg-[#6a412f]"
              href="#categorias"
            >
              Explorar categorias
              <Search className="h-4 w-4" />
            </a>
            <a
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#d8cbbd] px-5 text-sm font-semibold text-[#332f2a] transition hover:border-[#7f4f3a] hover:text-[#7f4f3a]"
              href="#contacto"
            >
              Consultar disponibilidad
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-[#e1d8cc] bg-white shadow-sm">
          <Image
            alt="Seleccion de productos BrisaBel: bijouterie, cartera, cosmetica y accesorios"
            className="h-full w-full object-cover"
            height={960}
            priority
            src="/images/brisabel-hero.png"
            width={1718}
          />
        </div>
      </section>

      <section className="border-y border-[#e6ded3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div className="flex items-center gap-3" key={benefit.label}>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef0e7] text-[#5f6f55]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-[#332f2a]">{benefit.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10" id="categorias">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
              Rubros
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#1f2320]">
              Un catalogo para distintas ocasiones
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#69625b]">
            La idea es crecer con productos rotativos, novedades por temporada
            y opciones tanto para uso personal como para regalos.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
            const style = categoryStyles[category.slug as keyof typeof categoryStyles];
            const Icon = style?.icon ?? Gift;
            const description = category.descripcion ?? style?.summary ?? "Categoria lista para sumar productos.";

            return (
              <article
                className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c7a18a]"
                key={category.id}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-[#f2e4db] text-[#7f4f3a]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{category.nombre}</h3>
                <p className="mt-3 text-sm leading-6 text-[#69625b]">
                  {description}
                </p>
                <div className="mt-5 flex gap-2 text-xs font-semibold text-[#7f4f3a]">
                  <span>{category._count.children} subcategorias</span>
                  <span aria-hidden="true">/</span>
                  <span>{category._count.productos} productos</span>
                </div>
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
              </article>
            );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[#e1d8cc] bg-white p-6 text-sm leading-6 text-[#69625b] shadow-sm">
            {hasError
              ? "No se pudieron cargar las categorias desde la base de datos."
              : "Todavia no hay categorias cargadas."}
          </div>
        )}
      </section>

      <section className="bg-[#1f2320] px-5 py-14 text-white sm:px-8 lg:px-10" id="destacados">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e0b79f]">
              Proximamente
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Destacados para publicar primero
            </h2>
            <p className="mt-4 text-base leading-7 text-[#d9d2ca]">
              Esta portada ya deja preparada la tienda para sumar un catalogo
              real, precios, stock y consultas por producto.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredProducts.map((product) => (
              <div
                className="rounded-lg border border-white/10 bg-white/8 p-5"
                key={product}
              >
                <span className="text-lg font-semibold">{product}</span>
                <p className="mt-2 text-sm leading-6 text-[#d9d2ca]">
                  Espacio listo para imagen, precio y boton de consulta.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10" id="contacto">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-[#e1d8cc] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#1f2320]">
              Queres consultar por algun producto?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#69625b]">
              Podemos sumar WhatsApp, Instagram o un formulario cuando definamos
              el canal principal de venta.
            </p>
          </div>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#7f4f3a] px-5 text-sm font-semibold text-white transition hover:bg-[#6a412f]"
            href="mailto:ventas@brisabel.com"
          >
            Contactar
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
