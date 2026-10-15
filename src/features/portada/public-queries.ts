import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { getDb } from "@/lib/db";

// Fotos del slider de la Home. Se cachean con la etiqueta "portada", que las
// acciones del panel invalidan.
export const PORTADA_TAG = "portada";

export type PortadaPublica = {
  id: number;
  ocasion: string;
  frase: string | null;
  imagen: string;
  imagenMovil: string | null;
  enlace: string | null;
};

async function getPortadasCache(): Promise<PortadaPublica[]> {
  "use cache";
  cacheTag(PORTADA_TAG);
  cacheLife("hours");

  return getDb().portada.findMany({
    where: { activa: true },
    orderBy: [{ orden: "asc" }, { id: "asc" }],
    select: { id: true, ocasion: true, frase: true, imagen: true, imagenMovil: true, enlace: true },
  });
}

// Se lee en el request (luego queda en caché), nunca durante el build.
export async function getPortadas() {
  await connection();

  return getPortadasCache();
}
