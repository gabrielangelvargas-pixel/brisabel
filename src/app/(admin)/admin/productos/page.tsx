import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProductoList } from "@/features/productos/components/producto-list";
import { getCategoriasParaProductos, getProductosAdmin } from "@/features/productos/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Productos" };

const mensajesOk: Record<string, string> = {
  creado: "Producto creado.",
  actualizado: "Cambios guardados.",
  eliminado: "Producto eliminado.",
  agrupado: "Productos agrupados en un modelo.",
  modelo: "Modelo actualizado.",
  desagrupado: "Modelo desagrupado: los productos se muestran por separado.",
};

export default function AdminProductosPage({ searchParams }: PageProps<"/admin/productos">) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin">
        ← Panel
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">Productos</h1>
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/admin/productos/nuevo"
        >
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      <Suspense fallback={<p className="mt-8 text-muted">Cargando...</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/productos">, "searchParams">) {
  await requireAdmin();

  const params = await searchParams;
  const buscar = typeof params.q === "string" ? params.q : "";
  const categoriaId = Number(params.categoria) || undefined;
  const [productos, categorias] = await Promise.all([
    getProductosAdmin({ categoriaId, buscar }),
    getCategoriasParaProductos(),
  ]);
  const ok = typeof params.ok === "string" ? mensajesOk[params.ok] : undefined;

  return (
    <div className="mt-8 grid gap-4">
      {ok ? (
        <p className="rounded-md border border-leaf/40 bg-brand-soft px-3 py-2 text-sm text-brand" role="status">
          {ok}
        </p>
      ) : null}

      {/* Formulario GET: los filtros quedan en la URL. */}
      <form className="flex flex-col gap-2 sm:flex-row" role="search">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por nombre o SKU</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            defaultValue={buscar}
            name="q"
            placeholder="Buscar por nombre o SKU"
          />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Categoría</span>
          <select
            className="h-11 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-brand"
            defaultValue={categoriaId ?? ""}
            name="categoria"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <button
          className="h-11 rounded-md border border-line bg-surface px-4 text-sm font-semibold transition hover:bg-brand-soft"
          type="submit"
        >
          Filtrar
        </button>
      </form>

      {/* Las casillas de cada fila pertenecen a este formulario (atributo form). */}
      <form
        action="/admin/productos/agrupar"
        className="flex flex-col gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
        id="agrupar-form"
      >
        <p className="text-muted">
          Para mostrar variantes juntas (colores, tamaños, largos), marcá los productos y agrupalos.
        </p>
        <button
          className="h-9 shrink-0 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
          type="submit"
        >
          Agrupar seleccionados
        </button>
      </form>

      <ProductoList productos={productos} />
      {productos.length === 200 ? (
        <p className="text-center text-xs text-muted">
          Se muestran los 200 más recientes. Usá el buscador para encontrar otros.
        </p>
      ) : null}
    </div>
  );
}
