import { Ungroup } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { desagruparAction, editarModeloAction } from "@/features/modelos/actions";
import { ModeloForm } from "@/features/modelos/components/modelo-form";
import { getModeloAdmin } from "@/features/modelos/queries";
import { modeloIdSchema } from "@/features/modelos/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar modelo" };

type Props = PageProps<"/admin/productos/modelos/[id]">;

export default function EditarModeloPage({ params }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/productos">
        ← Productos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Editar modelo</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ params }: Pick<Props, "params">) {
  await requireAdmin();

  const id = modeloIdSchema.safeParse((await params).id);
  const modelo = id.success ? await getModeloAdmin(id.data) : null;

  if (!modelo) {
    notFound();
  }

  return (
    <>
      <ModeloForm
        action={editarModeloAction.bind(null, modelo.id)}
        defaultValues={{
          nombre: modelo.nombre,
          variacion: modelo.variacion,
          variantes: Object.fromEntries(
            modelo.productos.map((p) => [
              p.id,
              { variante: p.variante ?? "", orden: String(p.ordenVariante), quitar: false },
            ]),
          ),
        }}
        permitirQuitar
        productos={modelo.productos.map((p) => ({ ...p, precioVenta: p.precioVenta.toString() }))}
        submitLabel="Guardar cambios"
      />

      <form action={desagruparAction} className="mt-10 border-t border-line pt-6">
        <input name="id" type="hidden" value={modelo.id} />
        <p className="text-sm text-muted">
          Desagrupar separa todos los productos: vuelven a mostrarse cada uno en su propia tarjeta. No se borra ningún
          producto.
        </p>
        <ConfirmSubmitButton
          className="mt-3 inline-flex h-11 items-center gap-2 rounded-md border border-accent/30 px-4 text-sm font-semibold text-accent transition hover:bg-accent-soft"
          message={`¿Desagrupar "${modelo.nombre}"? Los productos vuelven a mostrarse por separado.`}
        >
          <Ungroup className="size-4" />
          Desagrupar
        </ConfirmSubmitButton>
      </form>
    </>
  );
}
