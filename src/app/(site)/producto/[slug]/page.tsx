import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";
import { ProductoPagina } from "@/features/productos/components/producto-pagina";
import { getFichaProducto } from "@/features/productos/ficha";
import { PRODUCTO_IMAGEN_LADO, productoImagenUrl } from "@/features/productos/imagen-size";
import { formatPrecio } from "@/lib/format";

type Props = PageProps<"/producto/[slug]">;

// Vista previa al compartir: foto, nombre (con la variante) y precio.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await getFichaProducto((await params).slug);

  if (!ficha) {
    return { title: "Producto no encontrado" };
  }

  const elegida = ficha.variantes[ficha.indice];
  const titulo = ficha.variacion ? `${ficha.nombre} (${elegida.variante})` : ficha.nombre;
  const descripcion = `${formatPrecio(elegida.precioVenta)} · ${elegida.categoria}. ${siteConfig.name}: ${siteConfig.tagline.toLowerCase()}.`;
  const imagenUrl = productoImagenUrl(elegida.imagen);
  const imagen = imagenUrl
    ? { url: imagenUrl, width: PRODUCTO_IMAGEN_LADO, height: PRODUCTO_IMAGEN_LADO, alt: titulo }
    : siteConfig.ogImage;
  const url = `/producto/${elegida.slug}`;

  return {
    title: titulo,
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

export default function ProductoPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-5 sm:py-8">
      <Suspense fallback={<div className="aspect-square animate-pulse rounded-2xl bg-sand md:aspect-[2/1]" />}>
        <ProductoContenido params={params} />
      </Suspense>
    </main>
  );
}

async function ProductoContenido({ params }: Pick<Props, "params">) {
  const ficha = await getFichaProducto((await params).slug);

  if (!ficha) {
    notFound();
  }

  const elegida = ficha.variantes[ficha.indice];

  return (
    <>
      {/* El nombre visible está en el detalle (h2); el h1 es para buscadores y lectores. */}
      <h1 className="sr-only">{ficha.variacion ? `${ficha.nombre} (${elegida.variante})` : ficha.nombre}</h1>
      <nav aria-label="Migas de pan" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {ficha.migas.map((miga, index) => (
            <li className="flex items-center gap-1" key={miga.id}>
              {index > 0 ? <ChevronRight className="size-3.5" /> : null}
              <Link className="hover:text-accent" href={`/catalogo/${miga.slug}`}>
                {miga.nombre}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <ProductoPagina
        categoria={ficha.categoria.nombre}
        indiceInicial={ficha.indice}
        nombre={ficha.nombre}
        variacion={ficha.variacion}
        variantes={ficha.variantes}
      />

      <Link
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        href={`/catalogo/${ficha.categoria.slug}`}
      >
        <ArrowLeft className="size-4" />
        Ver más de {ficha.categoria.nombre}
      </Link>
    </>
  );
}
