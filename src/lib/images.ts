import "server-only";

import sharp from "sharp";

// Procesamiento de imágenes subidas desde el panel: se recortan a la medida
// pedida y se convierten a WebP.
const maxBytes = 8 * 1024 * 1024;

export type ImagenProcesada = { ok: true; data: Buffer } | { ok: false; error: string };

// Devuelve el archivo del formulario o null si no se eligió ninguno.
export function getArchivo(formData: FormData, campo: string) {
  const value = formData.get(campo);

  return value instanceof File && value.size > 0 ? value : null;
}

export async function procesarImagen(
  archivo: File,
  medidas: { ancho: number; alto: number },
): Promise<ImagenProcesada> {
  if (archivo.size > maxBytes) {
    return { ok: false, error: "La imagen no puede pesar más de 8 MB." };
  }

  try {
    const data = await sharp(Buffer.from(await archivo.arrayBuffer()))
      .rotate() // respeta la orientación de fotos de celular
      .resize(medidas.ancho, medidas.alto, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();

    return { ok: true, data };
  } catch {
    return { ok: false, error: "No se pudo leer la imagen. Probá con un JPG, PNG o WebP." };
  }
}

// Nombre único por versión ("producto-12-lx3k9a.webp"): al reemplazar la
// imagen cambia la URL, así navegadores y redes no muestran la anterior.
export function nombreArchivo(prefijo: string, id: number) {
  return `${prefijo}-${id}-${Date.now().toString(36)}.webp`;
}
