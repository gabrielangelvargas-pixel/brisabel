import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // El service worker nunca se cachea: así cada deploy lo actualiza enseguida.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // Subida de imágenes desde el panel (máx. 8 MB por imagen + margen).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
