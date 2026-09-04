import Link from "next/link";
import Image from "next/image";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categorias/actions";
import { socialImageConfig } from "@/config/app";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type Category = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen: string | null;
  orden: number;
  parentId: string | null;
  parent: {
    nombre: string;
  } | null;
  _count: {
    children: number;
    productos: number;
  };
};

type CategoryNode = Category & {
  children: CategoryNode[];
  depth: number;
};

const statusMessages = {
  created: "Categoria creada correctamente.",
  updated: "Categoria actualizada correctamente.",
  deleted: "Categoria eliminada correctamente.",
};

const errorMessages: Record<string, string> = {
  cycle: "No se puede mover una categoria dentro de su propia familia.",
  duplicate: "Ya existe una categoria con ese slug.",
  invalid: "Revisa los campos e intenta nuevamente.",
  image: "La imagen debe ser un archivo de imagen valido y pesar menos de 8 MB.",
  missing: "La categoria indicada ya no existe.",
  parent: "La categoria padre seleccionada no es valida.",
  relations: "No se puede borrar una categoria con hijas o productos asociados.",
};

function compareCategories(a: CategoryNode, b: CategoryNode) {
  return a.orden - b.orden || a.nombre.localeCompare(b.nombre);
}

function buildCategoryTree(categories: Category[]) {
  const nodesById = new Map<string, CategoryNode>();

  for (const category of categories) {
    nodesById.set(category.id, {
      ...category,
      children: [],
      depth: 0,
    });
  }

  const roots: CategoryNode[] = [];

  for (const node of nodesById.values()) {
    const parent = node.parentId ? nodesById.get(node.parentId) : null;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortAndSetDepth(nodes: CategoryNode[], depth: number) {
    nodes.sort(compareCategories);

    for (const node of nodes) {
      node.depth = depth;
      sortAndSetDepth(node.children, depth + 1);
    }
  }

  sortAndSetDepth(roots, 0);

  return roots;
}

function flattenTree(nodes: CategoryNode[]) {
  const flattened: CategoryNode[] = [];

  function visit(node: CategoryNode) {
    flattened.push(node);

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const node of nodes) {
    visit(node);
  }

  return flattened;
}

function collectFamilyIds(node: CategoryNode) {
  const ids = new Set<string>([node.id]);

  function visit(currentNode: CategoryNode) {
    for (const child of currentNode.children) {
      ids.add(child.id);
      visit(child);
    }
  }

  visit(node);

  return ids;
}

function renderParentOptions(categories: CategoryNode[], blockedIds = new Set<string>()) {
  return (
    <>
      <option value="">Sin padre</option>
      {categories
        .filter((category) => !blockedIds.has(category.id))
        .map((category) => (
          <option key={category.id} value={category.id}>
            {`${"-- ".repeat(category.depth)}${category.nombre}`}
          </option>
        ))}
    </>
  );
}

export default async function AdminCategoriasPage({
  searchParams,
}: PageProps<"/admin/categorias">) {
  await requireAdmin();

  const params = await searchParams;
  const categories = await getPrisma().categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: {
      parent: {
        select: {
          nombre: true,
        },
      },
      _count: {
        select: {
          children: true,
          productos: true,
        },
      },
    },
  });
  const categoryTree = buildCategoryTree(categories);
  const orderedCategories = flattenTree(categoryTree);
  const error = typeof params.error === "string" ? params.error : undefined;
  const successMessage = params.created
    ? statusMessages.created
    : params.updated
      ? statusMessages.updated
      : params.deleted
        ? statusMessages.deleted
        : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf8] px-4 py-6 text-[#1f2320] sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link className="text-sm font-semibold text-[#7f4f3a]" href="/admin">
          Volver al panel
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
              Catalogo
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Categorias</h1>
          </div>
        </div>

        {successMessage ? (
          <p className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessages[error] ?? errorMessages.invalid}
          </p>
        ) : null}

        <section className="mt-8 grid min-w-0 gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-6">
          <form
            action={createCategoryAction}
            className="min-w-0 rounded-lg border border-[#e1d8cc] bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="text-lg font-semibold">Nueva categoria</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nombre
                <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" name="nombre" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Slug
                <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" name="slug" required />
              </label>
              <p className="-mt-2 text-xs text-[#69625b]">
                Usar minusculas, numeros y guiones. La imagen se guardara como slug.webp en formato {socialImageConfig.width}x{socialImageConfig.height}.
              </p>
              <label className="grid gap-2 text-sm font-medium">
                Categoria padre
                <select className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" name="parentId">
                  {renderParentOptions(orderedCategories)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Orden
                <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" defaultValue="10" min="0" name="orden" required type="number" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Descripcion
                <textarea className="min-h-24 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3 py-2" name="descripcion" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Imagen
                <input className="w-full min-w-0 rounded-md border border-[#d8cbbd] px-3 py-2 text-sm" accept="image/*" name="imagen" type="file" />
              </label>
              <button className="min-h-10 w-full rounded-md bg-[#7f4f3a] px-4 py-2 text-sm font-semibold text-white">
                Crear categoria
              </button>
            </div>
          </form>

          <section className="min-w-0">
            <h2 className="text-lg font-semibold">Categorias cargadas</h2>
            <div className="mt-5 grid gap-3">
              {orderedCategories.map((category) => {
                const blockedParentIds = collectFamilyIds(category);
                const canDelete = category._count.children === 0 && category._count.productos === 0;

                return (
                  <article
                    className="rounded-lg border border-[#e1d8cc] bg-white p-4 shadow-sm"
                    key={category.id}
                    style={{
                      marginLeft: `min(${category.depth * 18}px, 54px)`,
                    }}
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#f2e4db] px-3 py-1 text-xs font-semibold text-[#7f4f3a]">
                            Orden {category.orden}
                          </span>
                          <span className="text-xs font-medium text-[#69625b]">
                            Nivel {category.depth + 1}
                          </span>
                        </div>
                        <h3 className="mt-3 break-words text-base font-semibold">
                          {category.nombre}
                        </h3>
                        <p className="mt-1 break-words text-sm text-[#69625b]">
                          {category.parent?.nombre ?? "Categoria principal"}
                        </p>
                        <div className="mt-3 flex min-w-0 items-center gap-3">
                          {category.imagen ? (
                            <Image
                              alt=""
                              className="h-14 w-28 shrink-0 rounded-md border border-[#eee4da] object-cover"
                              height={socialImageConfig.height}
                              src={`/media/categorias/${category.imagen}`}
                              width={socialImageConfig.width}
                            />
                          ) : null}
                          <p className="break-words text-xs text-[#69625b]">
                            Imagen: {category.imagen ?? "Sin imagen"}
                          </p>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 gap-3 text-sm sm:min-w-48">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98715c]">
                            Hijas
                          </dt>
                          <dd className="mt-1 text-[#69625b]">{category._count.children}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98715c]">
                            Productos
                          </dt>
                          <dd className="mt-1 text-[#69625b]">{category._count.productos}</dd>
                        </div>
                      </dl>
                    </div>

                    <details className="mt-4 rounded-md border border-[#eee4da] p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-[#7f4f3a]">
                        Editar categoria
                      </summary>
                      <form
                        action={updateCategoryAction}
                        className="mt-4 grid gap-4"
                      >
                        <input name="id" type="hidden" value={category.id} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-medium">
                            Nombre
                            <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" defaultValue={category.nombre} name="nombre" required />
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            Slug
                            <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" defaultValue={category.slug} name="slug" required />
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            Categoria padre
                            <select className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" defaultValue={category.parentId ?? ""} name="parentId">
                              {renderParentOptions(orderedCategories, blockedParentIds)}
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium">
                            Orden
                            <input className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" defaultValue={category.orden} min="0" name="orden" required type="number" />
                          </label>
                        </div>
                        <label className="grid gap-2 text-sm font-medium">
                          Descripcion
                          <textarea className="min-h-24 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3 py-2" defaultValue={category.descripcion ?? ""} name="descripcion" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Imagen
                          <input className="w-full min-w-0 rounded-md border border-[#d8cbbd] px-3 py-2 text-sm" accept="image/*" name="imagen" type="file" />
                          <span className="text-xs font-normal text-[#69625b]">
                            {category.imagen
                              ? `Actual: ${category.imagen}. Si seleccionas otra, se reemplaza por ${category.slug}.webp.`
                              : `Sin imagen. Si seleccionas una, se guardara como ${category.slug}.webp.`}
                          </span>
                        </label>
                        <button className="min-h-10 rounded-md bg-[#7f4f3a] px-4 py-2 text-sm font-semibold text-white sm:w-fit">
                          Guardar cambios
                        </button>
                      </form>
                      <form action={deleteCategoryAction} className="mt-3">
                        <input name="id" type="hidden" value={category.id} />
                        <button
                          className="min-h-10 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canDelete}
                        >
                          Eliminar categoria
                        </button>
                        {!canDelete ? (
                          <p className="mt-2 text-xs text-[#69625b]">
                            Para eliminarla, primero debe quedar sin hijas y sin productos.
                          </p>
                        ) : null}
                      </form>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
