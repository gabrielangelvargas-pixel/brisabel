import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Subida de imágenes desde el panel (máx. 8 MB por imagen + margen).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
