import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// Indica a los buscadores qué pueden rastrear y dónde está el mapa del sitio.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas privadas o sin valor para buscadores.
      disallow: ["/admin", "/ingresar", "/perfil", "/carrito", "/finalizar-compra"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
