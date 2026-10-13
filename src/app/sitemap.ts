import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getCategoriasVisibles } from "@/features/categorias/public-queries";
import { getProductosDeCategorias } from "@/features/productos/public-queries";

// Mapa del sitio para buscadores (/sitemap.xml): páginas públicas, categorías
// visibles y sus productos activos. Se arma en el request con datos en caché.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categorias = await getCategoriasVisibles();
  const productos = await getProductosDeCategorias(categorias.map((categoria) => categoria.id));

  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    ...categorias.map((categoria) => ({
      url: `${siteConfig.url}/catalogo/${categoria.slug}`,
      changeFrequency: "weekly" as const,
      priority: categoria.nivel === 0 ? 0.8 : 0.7,
    })),
    ...productos.map((producto) => ({
      url: `${siteConfig.url}/producto/${producto.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
