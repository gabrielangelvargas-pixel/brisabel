import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// Manifiesto de la app instalable (PWA): nombre, íconos y cómo se abre.
// Íconos en public/pwa (fondo blanco; el "maskable" deja margen para que
// Android lo recorte en círculo o en gota sin cortar el dibujo).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.name} · ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: siteConfig.pwa.background,
    theme_color: siteConfig.pwa.theme,
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Accesos directos al mantener apretado el ícono.
    shortcuts: [
      { name: "Catálogo", url: "/catalogo", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "Carrito", url: "/carrito", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
