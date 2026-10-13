import "server-only";

import { getCategoriasVisibles, type CategoriaPublica } from "@/features/categorias/public-queries";
import { idsFromRuta } from "@/features/categorias/tree";
import { agruparParaTienda } from "@/features/productos/agrupar-tienda";
import { getProductoPorSlug, type ProductoPublico } from "@/features/productos/public-queries";

export type FichaProducto = {
  // Nombre del modelo (o del producto si va solo), como en la tarjeta.
  nombre: string;
  variacion: string | null;
  variantes: ProductoPublico[];
  // Posición de la variante pedida dentro de `variantes`.
  indice: number;
  categoria: CategoriaPublica;
  // Categoría del producto y sus ancestros, de la principal a la hoja.
  migas: CategoriaPublica[];
};

// Datos de la página de un producto (/producto/[slug]). null si no existe, está
// inactivo o su categoría está oculta.
export async function getFichaProducto(slug: string): Promise<FichaProducto | null> {
  const [producto, visibles] = await Promise.all([getProductoPorSlug(slug), getCategoriasVisibles()]);
  const categoria = visibles.find((c) => c.id === producto?.categoriaId);

  if (!producto || !categoria) {
    return null;
  }

  const porId = new Map(visibles.map((c) => [c.id, c]));
  const migas = idsFromRuta(categoria.ruta)
    .map((id) => porId.get(id))
    .filter((c): c is CategoriaPublica => Boolean(c));

  // Misma regla que la grilla: un modelo con una sola variante visible va solo.
  const [tarjeta] = agruparParaTienda(producto.variantes);
  const ficha =
    tarjeta.tipo === "modelo"
      ? { nombre: tarjeta.nombre, variacion: tarjeta.variacion, variantes: tarjeta.variantes }
      : { nombre: tarjeta.producto.nombre, variacion: null, variantes: [tarjeta.producto] };

  return {
    ...ficha,
    indice: Math.max(0, ficha.variantes.findIndex((v) => v.id === producto.id)),
    categoria,
    migas,
  };
}
