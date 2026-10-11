import "server-only";

import sharp from "sharp";

import { IMAGEN_ALTO, IMAGEN_ANCHO } from "@/features/categorias/imagen-size";

// Imagen de categoría: se recorta y convierte a 1200x630 WebP.
const maxBytes = 8 * 1024 * 1024;

export type ImagenProcesada = { ok: true; data: Buffer } | { ok: false; error: string };

// Devuelve el archivo del formulario o null si no se eligió ninguno.
export function getArchivo(formData: FormData, campo: string) {
  const value = formData.get(campo);

  return value instanceof File && value.size > 0 ? value : null;
}

export async function procesarImagenCategoria(archivo: File): Promise<ImagenProcesada> {
  if (archivo.size > maxBytes) {
    return { ok: false, error: "La imagen no puede pesar más de 8 MB." };
  }

  try {
    const data = await sharp(Buffer.from(await archivo.arrayBuffer()))
      .rotate() // respeta la orientación de fotos de celular
      .resize(IMAGEN_ANCHO, IMAGEN_ALTO, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();

    return { ok: true, data };
  } catch {
    return { ok: false, error: "No se pudo leer la imagen. Probá con un JPG, PNG o WebP." };
  }
}

// Nombre único por versión: al reemplazar la imagen cambia la URL, así los
// navegadores y las redes no muestran la anterior desde su caché.
export function nombreArchivoCategoria(categoriaId: number) {
  return `categoria-${categoriaId}-${Date.now().toString(36)}.webp`;
}
