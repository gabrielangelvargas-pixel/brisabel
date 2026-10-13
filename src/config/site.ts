import { publicEnv } from "@/config/env";

export const siteConfig = {
  name: "Brisabel",
  tagline: "Regalos que inspiran",
  description: "Regalos, accesorios y joyas seleccionados para sorprender.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "es_AR",
  logo: {
    src: "/brand/logo.png",
    width: 800,
    height: 598,
  },
  // Colores de la app instalada (barra del sistema y pantalla de inicio).
  // Hex porque los usan el manifiesto y el navegador, no Tailwind.
  pwa: {
    theme: "#ffffff",
    background: "#fbfaf7",
  },
  ogImage: {
    url: "/og.png",
    width: 1200,
    height: 630,
  },
};
