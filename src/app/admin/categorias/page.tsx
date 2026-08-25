import Link from "next/link";

import { createCategoryAction } from "@/app/admin/categorias/actions";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminCategoriasPage({
  searchParams,
}: PageProps<"/admin/categorias">) {
  await requireAdmin();

  const params = await searchParams;
  const categories = await getPrisma().categoria.findMany({
    orderBy: [{ parentId: "asc" }, { orden: "asc" }, { nombre: "asc" }],
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

  const parentCategories = categories.filter((category) => !category.parentId);

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

        {params.created ? (
          <p className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Categoria creada correctamente.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Revisá los campos e intenta nuevamente.
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
              <label className="grid gap-2 text-sm font-medium">
                Categoria padre
                <select className="h-10 w-full min-w-0 rounded-md border border-[#d8cbbd] px-3" name="parentId">
                  <option value="">Sin padre</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
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
              <button className="min-h-10 w-full rounded-md bg-[#7f4f3a] px-4 py-2 text-sm font-semibold text-white">
                Crear categoria
              </button>
            </div>
          </form>

          <section className="min-w-0 rounded-lg border border-[#e1d8cc] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Categorias cargadas</h2>

            <div className="mt-5 grid gap-3 md:hidden">
              {categories.map((category) => (
                <article className="rounded-md border border-[#eee4da] p-4" key={category.id}>
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold">{category.nombre}</h3>
                      <p className="mt-1 break-words text-sm text-[#69625b]">
                        {category.parent?.nombre ?? "Categoria principal"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f2e4db] px-3 py-1 text-xs font-semibold text-[#7f4f3a]">
                      {category.orden}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98715c]">
                        Slug
                      </dt>
                      <dd className="mt-1 break-words text-[#69625b]">{category.slug}</dd>
                    </div>
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
                </article>
              ))}
            </div>

            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="border-b border-[#e1d8cc] text-xs uppercase tracking-[0.12em] text-[#69625b]">
                  <tr>
                    <th className="py-3 pr-4">Orden</th>
                    <th className="py-3 pr-4">Nombre</th>
                    <th className="py-3 pr-4">Padre</th>
                    <th className="py-3 pr-4">Slug</th>
                    <th className="py-3 pr-4">Hijas</th>
                    <th className="py-3 pr-4">Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr className="border-b border-[#f0e8df]" key={category.id}>
                      <td className="py-3 pr-4">{category.orden}</td>
                      <td className="py-3 pr-4 font-medium">{category.nombre}</td>
                      <td className="py-3 pr-4 text-[#69625b]">{category.parent?.nombre ?? "-"}</td>
                      <td className="py-3 pr-4 text-[#69625b]">{category.slug}</td>
                      <td className="py-3 pr-4">{category._count.children}</td>
                      <td className="py-3 pr-4">{category._count.productos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
