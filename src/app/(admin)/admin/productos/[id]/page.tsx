import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { editarProductoAction } from "@/features/productos/actions";
import { ProductoForm } from "@/features/productos/components/producto-form";
import { getCategoriasParaProductos, getProductoById } from "@/features/productos/queries";
import { productoIdSchema } from "@/features/productos/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar producto" };

export default function EditarProductoPage({ params }: PageProps<"/admin/productos/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/productos">
        ← Productos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Editar producto</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ params }: Pick<PageProps<"/admin/productos/[id]">, "params">) {
  await requireAdmin();

  const id = productoIdSchema.safeParse((await params).id);
  const [producto, categorias] = await Promise.all([
    id.success ? getProductoById(id.data) : null,
    getCategoriasParaProductos(),
  ]);

  if (!producto) {
    notFound();
  }

  return (
    <ProductoForm
      action={editarProductoAction.bind(null, producto.id)}
      categorias={categorias}
      defaultValues={{
        sku: producto.sku,
        nombre: producto.nombre,
        slug: producto.slug,
        // "12500.00" -> "12500" (y "8500.50" -> "8500.5") para editar cómodo.
        precioCosto: Number(producto.precioCosto).toString(),
        precioVenta: Number(producto.precioVenta).toString(),
        categoriaId: String(producto.categoriaId),
        activo: producto.activo,
        destacado: producto.destacado,
      }}
      imagenActual={producto.imagen}
      submitLabel="Guardar cambios"
    />
  );
}
