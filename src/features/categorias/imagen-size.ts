// Medidas de la imagen de categoría (vista previa al compartir en redes y
// tarjetas del sitio). Única fuente de verdad: cambiar acá cambia el recorte
// de las imágenes nuevas y la proporción con que se muestran.
export const IMAGEN_ANCHO = 1200;
export const IMAGEN_ALTO = 630;

// Para usar en style={...}: Tailwind no admite clases armadas con variables.
export const IMAGEN_PROPORCION = { aspectRatio: `${IMAGEN_ANCHO} / ${IMAGEN_ALTO}` };
