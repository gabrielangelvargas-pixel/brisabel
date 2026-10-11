import "server-only";

import { buildTree, flattenTree, MAX_NIVEL } from "@/features/categorias/tree";
import { getDb } from "@/lib/db";

const categoriaSelect = {
  id: true,
  nombre: true,
  slug: true,
  descripcion: true,
  orden: true,
  activa: true,
  parentId: true,
  nivel: true,
  ruta: true,
  _count: { select: { hijas: true } },
} as const;

// Árbol completo para el panel, aplanado en orden de lectura.
export async function getCategoriasAdmin() {
  const categorias = await getDb().categoria.findMany({ select: categoriaSelect });

  return flattenTree(buildTree(categorias));
}

export async function getCategoriaById(id: number) {
  return getDb().categoria.findUnique({ where: { id }, select: categoriaSelect });
}

// Cuántos niveles tiene una categoría por debajo (0 si no tiene hijas).
export async function getAlturaSubarbol(categoria: { ruta: string; nivel: number }) {
  const { _max } = await getDb().categoria.aggregate({
    where: { ruta: { startsWith: categoria.ruta } },
    _max: { nivel: true },
  });

  return (_max.nivel ?? categoria.nivel) - categoria.nivel;
}

// Posibles padres para crear o mover una categoría. Al editar, se excluye la
// propia categoría con su subárbol y los padres que dejarían a sus
// descendientes por debajo del nivel máximo.
export async function getPadresPosibles(editando?: { ruta: string; altura: number }) {
  const maxNivelPadre = MAX_NIVEL - 1 - (editando?.altura ?? 0);
  const categorias = await getDb().categoria.findMany({
    where: {
      nivel: { lte: maxNivelPadre },
      ...(editando ? { NOT: { ruta: { startsWith: editando.ruta } } } : {}),
    },
    select: categoriaSelect,
  });

  return flattenTree(buildTree(categorias));
}
