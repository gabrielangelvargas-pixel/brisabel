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
import { ProductoGrid } from "@/features/productos/components/producto-grid";
import { getProductosDeCategorias } from "@/features/productos/public-queries";
import { cn } from "@/lib/cn";

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

  const { categoria, migas, hijas, subarbol } = resultado;
  const imagenUrl = categoriaImagenUrl(categoria.imagen);
  // Columna de texto: sin imagen va el título; con imagen, solo si hay migas o descripción.
  const textoVisible = !imagenUrl || migas.length > 0 || Boolean(categoria.descripcion);

  return (
    <>
      <section className="bg-sand">
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl items-center gap-5 px-5 py-5 sm:py-8 md:gap-10",
            textoVisible && imagenUrl && "md:grid-cols-[1fr_1.1fr]",
          )}
        >
          {/* Con imagen, el título ya está en ella: queda solo para lectores de pantalla y buscadores. */}
          {imagenUrl ? <h1 className="sr-only">{categoria.nombre}</h1> : null}

          {textoVisible ? (
            <div>
              {/* Migas: solo las categorías superiores (en una principal no hay). */}
              {migas.length > 0 ? (
                <nav aria-label="Migas de pan" className="mb-2">
                  <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
                    {migas.map((miga, index) => (
                      <li className="flex items-center gap-1" key={miga.id}>
                        {index > 0 ? <ChevronRight className="size-3.5" /> : null}
                        <Link className="hover:text-accent" href={`/catalogo/${miga.slug}`}>
                          {miga.nombre}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              {!imagenUrl ? (
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-display text-2xl leading-tight font-semibold text-brand sm:text-3xl lg:text-4xl">
                    {categoria.nombre}
                  </h1>
                  {/* Sin imagen, el botón Compartir va junto al título. */}
                  <ShareButton title={tituloCompartir(categoria.nombre)} variant="icon" />
                </div>
              ) : null}
              {categoria.descripcion ? (
                <p className="mt-2 max-w-xl leading-7 text-muted sm:text-lg">{categoria.descripcion}</p>
              ) : null}
            </div>
          ) : null}

          {imagenUrl ? (
            <div className="relative">
              <Image
                alt={categoria.nombre}
                className="w-full rounded-2xl object-cover shadow-xl shadow-brand/10 ring-1 ring-black/5 sm:rounded-[2rem]"
                height={IMAGEN_ALTO}
                loading="eager"
                src={imagenUrl}
                style={IMAGEN_PROPORCION}
                unoptimized
                width={IMAGEN_ANCHO}
              />
              <ShareButton
                className="absolute right-3 bottom-3"
                title={tituloCompartir(categoria.nombre)}
                variant="icon"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:py-10">
        {hijas.length > 0 ? (
          <nav aria-label="Subcategorías" className="mb-8 sm:mb-10">
            <CategoriaGrid categorias={hijas} miniatura />
          </nav>
        ) : null}
        {/* Todos los productos de la categoría y sus subcategorías, sin filtrar. */}
        <ProductosDeCategoria categoriaIds={subarbol} titulo={hijas.length > 0 ? "Productos" : null} />
      </section>
    </>
  );
}

// Productos de la categoría y de todo su subárbol. En una categoría padre van
// debajo de las subcategorías, con título.
async function ProductosDeCategoria({ categoriaIds, titulo }: { categoriaIds: number[]; titulo: string | null }) {
  const productos = await getProductosDeCategorias(categoriaIds);

  if (productos.length === 0) {
    // En una categoría padre ya se ven las subcategorías: sin aviso de vacío.
    if (titulo) return null;

    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
        <PackageOpen className="mx-auto size-10 text-leaf" />
        <p className="mt-4 font-semibold">Estamos cargando los productos de esta categoría</p>
        <p className="mt-1 text-sm text-muted">Volvé pronto para descubrirlos.</p>
      </div>
    );
  }

  return (
    <>
      {titulo ? <h2 className="mb-4 font-display text-xl font-semibold text-brand sm:text-2xl">{titulo}</h2> : null}
      <ProductoGrid productos={productos} />
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
