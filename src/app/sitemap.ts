import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getCategoriasVisibles } from "@/features/categorias/public-queries";

// Mapa del sitio para buscadores (/sitemap.xml): páginas públicas y todas las
// categorías visibles. Se arma en el request con los datos en caché.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categorias = await getCategoriasVisibles();

  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    ...categorias.map((categoria) => ({
      url: `${siteConfig.url}/catalogo/${categoria.slug}`,
      changeFrequency: "weekly" as const,
      priority: categoria.nivel === 0 ? 0.8 : 0.7,
    })),
  ];
}
