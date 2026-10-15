// Fotos del slider de la portada: horizontales 16:10. En el celular se
// recortan a lo alto, por eso conviene la escena principal al centro.
export const PORTADA_ANCHO = 1600;
export const PORTADA_ALTO = 1000;

export function portadaImagenUrl(imagen: string) {
  return `/media/portadas/${imagen}`;
}
