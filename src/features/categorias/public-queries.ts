import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { buildTree, flattenTree, idsFromRuta } from "@/features/categorias/tree";
import { getDb } from "@/lib/db";

// Lecturas del catálogo público. Se cachean con la etiqueta "categorias", que
// las acciones del panel invalidan con updateTag al guardar cambios.
export const CATEGORIAS_TAG = "categorias";

export type CategoriaPublica = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen: string | null;
  orden: number;
  activa: boolean;
  parentId: number | null;
  nivel: number;
  ruta: string;
};

// Todas las categorías visibles: activas y con todos sus ancestros activos
// (ocultar una categoría oculta su subárbol).
async function getCategoriasVisiblesCache(): Promise<CategoriaPublica[]> {
  "use cache";
  cacheTag(CATEGORIAS_TAG);
  cacheLife("hours");

  const todas = await getDb().categoria.findMany({
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
      imagen: true,
      orden: true,
      activa: true,
      parentId: true,
      nivel: true,
      ruta: true,
    },
  });
  const activas = new Set(todas.filter((c) => c.activa).map((c) => c.id));

  return todas.filter((c) => idsFromRuta(c.ruta).every((id) => activas.has(id)));
}

// connection(): los datos se leen en el request (y luego quedan en caché),
// nunca durante el build, que no tiene acceso a la base.
export async function getCategoriasVisibles() {
  await connection();

  return getCategoriasVisiblesCache();
}

export async function getCategoriasPrincipales() {
  return buildTree(await getCategoriasVisibles()).map(({ hijas, ...categoria }) => ({
    ...categoria,
    cantidadHijas: hijas.length,
  }));
}

// Categoría por slug con sus migas de pan (ancestros), sus hijas visibles y los
// ids de todo su subárbol visible (ella incluida) para listar sus productos, en
// el mismo orden en que se muestran las categorías (padre, luego sus hijas).
export async function getCategoriaPublica(slug: string) {
  const visibles = await getCategoriasVisibles();
  const categoria = visibles.find((c) => c.slug === slug);

  if (!categoria) {
    return null;
  }

  const porId = new Map(visibles.map((c) => [c.id, c]));
  const migas = idsFromRuta(categoria.ruta)
    .slice(0, -1)
    .map((id) => porId.get(id))
    .filter((c): c is CategoriaPublica => Boolean(c));
  const hijas = buildTree(visibles.filter((c) => c.parentId === categoria.id));

  const subarbol = flattenTree(buildTree(visibles.filter((c) => c.ruta.startsWith(categoria.ruta)))).map((c) => c.id);

  return { categoria, migas, hijas, subarbol };
}
