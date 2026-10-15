import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { editarPortadaAction } from "@/features/portada/actions";
import { PortadaForm } from "@/features/portada/components/portada-form";
import { getPortadaById } from "@/features/portada/queries";
import { portadaIdSchema } from "@/features/portada/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar foto de portada" };

export default function EditarPortadaPage({ params }: PageProps<"/admin/portada/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/portada">
        ← Portada
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Editar foto de portada</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted">Cargando...</p>}>
          <Formulario params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario({ params }: Pick<PageProps<"/admin/portada/[id]">, "params">) {
  await requireAdmin();

  const id = portadaIdSchema.safeParse((await params).id);
  const portada = id.success ? await getPortadaById(id.data) : null;

  if (!portada) {
    notFound();
  }

  return (
    <PortadaForm
      action={editarPortadaAction.bind(null, portada.id)}
      defaultValues={{
        ocasion: portada.ocasion,
        frase: portada.frase ?? "",
        enlace: portada.enlace ?? "",
        orden: String(portada.orden),
        activa: portada.activa,
      }}
      imagenActual={portada.imagen}
      submitLabel="Guardar cambios"
    />
  );
}
