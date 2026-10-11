import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { crearProductoAction } from "@/features/productos/actions";
import { ProductoForm } from "@/features/productos/components/producto-form";
import { getCategoriasParaProductos } from "@/features/productos/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function NuevoProductoPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/productos">
        ← Productos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Nuevo producto</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario() {
  await requireAdmin();

  const categorias = await getCategoriasParaProductos();

  return (
    <ProductoForm
      action={crearProductoAction}
      categorias={categorias}
      defaultValues={{
        sku: "",
        nombre: "",
        slug: "",
        precioCosto: "",
        precioVenta: "",
        categoriaId: "",
        activo: true,
        destacado: false,
      }}
      submitLabel="Crear producto"
    />
  );
}
