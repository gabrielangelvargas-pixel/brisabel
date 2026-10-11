import "server-only";

import { IMAGEN_ALTO, IMAGEN_ANCHO } from "@/features/categorias/imagen-size";
import { nombreArchivo, procesarImagen } from "@/lib/images";

export { getArchivo } from "@/lib/images";

// Imagen de categoría: IMAGEN_ANCHO x IMAGEN_ALTO en WebP.
export function procesarImagenCategoria(archivo: File) {
  return procesarImagen(archivo, { ancho: IMAGEN_ANCHO, alto: IMAGEN_ALTO });
}

export function nombreArchivoCategoria(categoriaId: number) {
  return nombreArchivo("categoria", categoriaId);
}
