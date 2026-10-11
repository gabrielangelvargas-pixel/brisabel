// Reglas y utilidades del árbol de categorías (funciones puras, sin base).

// Niveles permitidos: 0 (raíz), 1 (hija) y 2 (nieta).
export const MAX_NIVEL = 2;

export type CategoriaNodo = {
  id: number;
  nombre: string;
  slug: string;
  orden: number;
  activa: boolean;
  parentId: number | null;
  nivel: number;
  ruta: string;
};

// URL pública de la imagen de una categoría (servida por /media/categorias).
export function categoriaImagenUrl(imagen: string | null) {
  return imagen ? `/media/categorias/${imagen}` : null;
}

export type CategoriaArbol<T extends CategoriaNodo = CategoriaNodo> = T & {
  hijas: CategoriaArbol<T>[];
};

// "Aros de Plata 925" -> "aros-de-plata-925"
export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// Ruta materializada: "/" para raíz -> "/<id>/"; con padre "/1/4/" -> "/1/4/<id>/".
export function buildRuta(parentRuta: string | null, id: number) {
  return `${parentRuta ?? "/"}${id}/`;
}

export function idsFromRuta(ruta: string) {
  return ruta.split("/").filter(Boolean).map(Number);
}

// ¿"candidato" está dentro del subárbol de "categoria" (o es ella misma)?
export function isInSubtree(candidatoRuta: string, categoriaRuta: string) {
  return candidatoRuta.startsWith(categoriaRuta);
}

// Arma el árbol ordenado (por orden y nombre) a partir de la lista plana.
export function buildTree<T extends CategoriaNodo>(categorias: T[]): CategoriaArbol<T>[] {
  const nodos = new Map<number, CategoriaArbol<T>>();

  for (const categoria of categorias) {
    nodos.set(categoria.id, { ...categoria, hijas: [] });
  }

  const raices: CategoriaArbol<T>[] = [];

  for (const nodo of nodos.values()) {
    const padre = nodo.parentId === null ? undefined : nodos.get(nodo.parentId);
    (padre ? padre.hijas : raices).push(nodo);
  }

  const ordenar = (lista: CategoriaArbol<T>[]) => {
    lista.sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
    lista.forEach((nodo) => ordenar(nodo.hijas));
  };

  ordenar(raices);

  return raices;
}

// Recorre el árbol en orden de lectura (padre, luego sus hijas).
export function flattenTree<T extends CategoriaNodo>(arbol: CategoriaArbol<T>[]): CategoriaArbol<T>[] {
  return arbol.flatMap((nodo) => [nodo, ...flattenTree(nodo.hijas)]);
}
