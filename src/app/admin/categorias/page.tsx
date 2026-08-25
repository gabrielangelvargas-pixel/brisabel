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
    <main className="min-h-screen bg-[#fbfaf8] px-5 py-8 text-[#1f2320]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-semibold text-[#7f4f3a]" href="/admin">
          Volver al panel
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
              Catalogo
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Categorias</h1>
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

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            action={createCategoryAction}
            className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Nueva categoria</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nombre
                <input className="h-10 rounded-md border border-[#d8cbbd] px-3" name="nombre" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Slug
                <input className="h-10 rounded-md border border-[#d8cbbd] px-3" name="slug" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Categoria padre
                <select className="h-10 rounded-md border border-[#d8cbbd] px-3" name="parentId">
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
                <input className="h-10 rounded-md border border-[#d8cbbd] px-3" defaultValue="10" min="0" name="orden" required type="number" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Descripcion
                <textarea className="min-h-24 rounded-md border border-[#d8cbbd] px-3 py-2" name="descripcion" />
              </label>
              <button className="h-10 rounded-md bg-[#7f4f3a] text-sm font-semibold text-white">
                Crear categoria
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-[#e1d8cc] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Categorias cargadas</h2>
            <div className="mt-5 overflow-x-auto">
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
