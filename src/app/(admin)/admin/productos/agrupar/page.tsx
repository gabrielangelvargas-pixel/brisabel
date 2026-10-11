import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { agruparAction } from "@/features/modelos/actions";
import { ModeloForm } from "@/features/modelos/components/modelo-form";
import { getProductosParaAgrupar } from "@/features/modelos/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Agrupar productos" };

type Props = PageProps<"/admin/productos/agrupar">;

export default function AgruparPage({ searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/productos">
        ← Productos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Agrupar en un modelo</h1>
      <p className="mt-2 text-muted">
        Los productos agrupados se muestran en la tienda en una sola tarjeta, con botones para elegir la variante.
      </p>
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

  // ?ids=1&ids=2&ids=3 (casillas del listado).
  const ids = [(await searchParams).ids ?? []]
    .flat()
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
  const productos = ids.length >= 2 ? await getProductosParaAgrupar(ids) : [];

  if (productos.length < 2) {
    return (
      <FormAlert>
        Elegí al menos 2 productos en el listado (con las casillas) y tocá &quot;Agrupar seleccionados&quot;.
      </FormAlert>
    );
  }

  if (new Set(productos.map((p) => p.categoriaId)).size > 1) {
    return (
      <FormAlert>
        Los productos de un modelo tienen que ser de la misma categoría. Elegiste productos de:{" "}
        {[...new Set(productos.map((p) => p.categoria.nombre))].join(", ")}.
      </FormAlert>
    );
  }

  const yaAgrupados = productos.filter((p) => p.modeloId);

  return (
    <>
      {yaAgrupados.length > 0 ? (
        <p className="mb-6 rounded-md border border-gold/40 bg-gold-soft px-3 py-2 text-sm text-gold-strong">
          {yaAgrupados.length === 1 ? "Un producto ya estaba" : `${yaAgrupados.length} productos ya estaban`} en otro modelo:
          se van a pasar a este.
        </p>
      ) : null}
      <ModeloForm
        action={agruparAction}
        defaultValues={{
          nombre: productos[0].nombre,
          variacion: "",
          variantes: Object.fromEntries(
            productos.map((p, i) => [p.id, { variante: p.variante ?? "", orden: String(i), quitar: false }]),
          ),
        }}
        productos={productos.map((p) => ({ ...p, precioVenta: p.precioVenta.toString() }))}
        submitLabel="Agrupar"
      />
    </>
  );
}
