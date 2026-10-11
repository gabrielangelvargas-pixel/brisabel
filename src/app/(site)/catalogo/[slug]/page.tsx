import { ChevronRight, PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ShareButton } from "@/components/ui/share-button";
import { siteConfig } from "@/config/site";
import { CategoriaGrid, CategoriaGridSkeleton } from "@/features/categorias/components/categoria-grid";
import { IMAGEN_ALTO, IMAGEN_ANCHO, IMAGEN_PROPORCION } from "@/features/categorias/imagen-size";
import { getCategoriaPublica } from "@/features/categorias/public-queries";
import { categoriaImagenUrl } from "@/features/categorias/tree";

type Props = PageProps<"/catalogo/[slug]">;

// Metadatos para buscadores y vista previa al compartir (Open Graph).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await getCategoriaPublica((await params).slug);

  if (!resultado) {
    return { title: "Categoría no encontrada" };
  }

  const { categoria, hijas } = resultado;
  const titulo = tituloCompartir(categoria.nombre);
  const descripcion = categoria.descripcion ?? descripcionAutomatica(hijas.map((hija) => hija.nombre));
  const imagenUrl = categoriaImagenUrl(categoria.imagen);
  const imagen = imagenUrl
    ? { url: imagenUrl, width: IMAGEN_ANCHO, height: IMAGEN_ALTO, alt: categoria.nombre }
    : siteConfig.ogImage;
  const url = `/catalogo/${categoria.slug}`;

  return {
    title: categoria.nombre,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: titulo,
      description: descripcion,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [imagen],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagen.url],
    },
  };
}

// Ej.: "Plata 900 / 925 de Brisabel: regalos que inspiran". Se usa en la vista
// previa de redes y en el botón Compartir.
function tituloCompartir(nombre: string) {
  return `${nombre} de ${siteConfig.name}: ${siteConfig.tagline.toLowerCase()}`;
}

// Sin descripción cargada: no repetir el título. Si hay subcategorías se
// mencionan ("Encontrá Aros, Anillos y Cadenas…"); si no, la del sitio.
function descripcionAutomatica(subcategorias: string[]) {
  if (subcategorias.length === 0) {
    return siteConfig.description;
  }

  const lista =
    subcategorias.length === 1
      ? subcategorias[0]
      : `${subcategorias.slice(0, -1).join(", ")} y ${subcategorias.at(-1)}`;

  return `Encontrá ${lista}. ${siteConfig.description}`;
}

export default function CategoriaPage({ params }: Props) {
  return (
    <main className="flex-1">
      <Suspense fallback={<CategoriaFallback />}>
        <CategoriaContenido params={params} />
      </Suspense>
    </main>
  );
}

async function CategoriaContenido({ params }: Pick<Props, "params">) {
  const resultado = await getCategoriaPublica((await params).slug);

  if (!resultado) {
    notFound();
  }

  const { categoria, migas, hijas } = resultado;
  const imagenUrl = categoriaImagenUrl(categoria.imagen);

  return (
    <>
      <section className="bg-sand">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-10 sm:py-14 md:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <nav aria-label="Migas de pan">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
                <li>
                  <Link className="hover:text-accent" href="/catalogo">
                    Catálogo
                  </Link>
                </li>
                {migas.map((miga) => (
                  <li className="flex items-center gap-1" key={miga.id}>
                    <ChevronRight className="size-3.5" />
                    <Link className="hover:text-accent" href={`/catalogo/${miga.slug}`}>
                      {miga.nombre}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <h1 className="mt-4 font-display text-4xl leading-tight font-semibold text-brand sm:text-5xl">
              {categoria.nombre}
            </h1>
            {categoria.descripcion ? (
              <p className="mt-4 max-w-xl text-lg leading-8 text-muted">{categoria.descripcion}</p>
            ) : null}
            <ShareButton className="mt-6" title={tituloCompartir(categoria.nombre)} />
          </div>

          {imagenUrl ? (
            <Image
              alt={categoria.nombre}
              className="w-full rounded-[2rem] object-cover shadow-xl shadow-brand/10 ring-1 ring-black/5"
              height={IMAGEN_ALTO}
              loading="eager"
              src={imagenUrl}
              style={IMAGEN_PROPORCION}
              unoptimized
              width={IMAGEN_ANCHO}
            />
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:py-16">
        {hijas.length > 0 ? (
          <>
            <h2 className="font-display text-2xl font-semibold text-brand sm:text-3xl">Explorá {categoria.nombre}</h2>
            <div className="mt-8">
              <CategoriaGrid categorias={hijas} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <PackageOpen className="mx-auto size-10 text-leaf" />
            <p className="mt-4 font-semibold">Estamos cargando los productos de esta categoría</p>
            <p className="mt-1 text-sm text-muted">Volvé pronto para descubrirlos.</p>
          </div>
        )}
      </section>
    </>
  );
}

function CategoriaFallback() {
  return (
    <>
      <section className="bg-sand">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:py-14">
          <div className="h-4 w-40 animate-pulse rounded bg-line" />
          <div className="mt-6 h-12 w-2/3 max-w-md animate-pulse rounded bg-line" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:py-16">
        <CategoriaGridSkeleton />
      </section>
    </>
  );
}
