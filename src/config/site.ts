import { publicEnv } from "@/config/env";

export const siteConfig = {
  name: "Brisabel",
  description: "Accesorios, joyas y regalos seleccionados.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "es_AR",
  ogImage: {
    url: "/og.webp",
    width: 1200,
    height: 628,
  },
};
