import { connection } from "next/server";

import heroImage from "@/assets/home/hero.webp";
import { PortadaSlider, type SlidePortada } from "@/features/portada/components/portada-slider";
import { portadaImagenUrl } from "@/features/portada/imagen-size";
import { getPortadas } from "@/features/portada/public-queries";

// Sin fotos cargadas en el panel (o mientras cargan), la portada muestra la
// foto de siempre.
const slideInicial: SlidePortada = {
  key: "inicial",
  ocasion: "Regalos que inspiran",
  frase: null,
  src: heroImage,
  enlace: null,
};

export function HeroFallback() {
  return <PortadaSlider slides={[slideInicial]} />;
}

// Portada de la Home: slider con las fotos administradas en Panel → Portada.
export async function Hero() {
  // connection() afuera del catch: en el prerender tiene que cortar acá (no
  // es un error). Si la base no responde, la Home igual se muestra.
  await connection();
  const portadas = await getPortadas().catch((error: unknown) => {
    console.error("Portada: no se pudieron leer las fotos", error);
    return [];
  });

  if (portadas.length === 0) {
    return <HeroFallback />;
  }

  return (
    <PortadaSlider
      slides={portadas.map((portada) => ({
        key: String(portada.id),
        ocasion: portada.ocasion,
        frase: portada.frase,
        src: portadaImagenUrl(portada.imagen),
        srcMovil: portada.imagenMovil ? portadaImagenUrl(portada.imagenMovil) : null,
        enlace: portada.enlace,
      }))}
    />
  );
}
