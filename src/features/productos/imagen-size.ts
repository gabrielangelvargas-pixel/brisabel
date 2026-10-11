// Imagen de producto: cuadrada, el formato habitual en tarjetas de tienda.
export const PRODUCTO_IMAGEN_LADO = 1000;

export function productoImagenUrl(imagen: string | null) {
  return imagen ? `/media/productos/${imagen}` : null;
}
