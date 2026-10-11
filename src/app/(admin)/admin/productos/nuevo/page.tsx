import { Copy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { crearProductoAction } from "@/features/productos/actions";
import { ProductoForm } from "@/features/productos/components/producto-form";
import { getCategoriasParaProductos, getProductoById } from "@/features/productos/queries";
import { productoIdSchema, type ProductoFormValues } from "@/features/productos/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nuevo producto" };

type Props = PageProps<"/admin/productos/nuevo">;

const vacio: ProductoFormValues = {
  sku: "",
  nombre: "",
  slug: "",
  precioCosto: "",
  precioVenta: "",
  categoriaId: "",
  activo: true,
  destacado: false,
};

export default function NuevoProductoPage({ searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/productos">
        ← Productos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Nuevo producto</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ searchParams }: Pick<Props, "searchParams">) {
  await requireAdmin();

  // ?duplicar=ID: copia los datos de otro producto, salvo SKU, slug e imagen.
  const duplicarId = productoIdSchema.safeParse((await searchParams).duplicar);
  const [categorias, original] = await Promise.all([
    getCategoriasParaProductos(),
    duplicarId.success ? getProductoById(duplicarId.data) : null,
  ]);

  const defaultValues: ProductoFormValues = original
    ? {
        ...vacio,
        nombre: original.nombre,
        precioCosto: Number(original.precioCosto).toString(),
        precioVenta: Number(original.precioVenta).toString(),
        categoriaId: String(original.categoriaId),
        activo: original.activo,
        destacado: original.destacado,
      }
    : vacio;

  return (
    <>
      {original ? (
        <p className="mb-6 flex items-start gap-2 rounded-md border border-line bg-brand-soft px-3 py-2 text-sm text-brand">
          <Copy className="mt-0.5 size-4 shrink-0" />
          <span>
            Duplicando <strong>{original.nombre}</strong> ({original.sku}). Completá el SKU y, si querés, la imagen.
          </span>
        </p>
      ) : null}
      <ProductoForm
        action={crearProductoAction}
        categorias={categorias}
        defaultValues={defaultValues}
        submitLabel="Crear producto"
      />
    </>
  );
}
