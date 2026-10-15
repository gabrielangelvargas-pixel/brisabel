// Fotos del slider de la portada. La horizontal (16:10) es la principal; la
// vertical (9:16) es opcional y se usa en celulares, que si no recortan los
// costados de la horizontal.
export const PORTADA_ANCHO = 1600;
export const PORTADA_ALTO = 1000;
export const PORTADA_MOVIL_ANCHO = 900;
export const PORTADA_MOVIL_ALTO = 1600;

export function portadaImagenUrl(imagen: string) {
  return `/media/portadas/${imagen}`;
}
