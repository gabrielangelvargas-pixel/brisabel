import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { crearPortadaAction } from "@/features/portada/actions";
import { PortadaForm } from "@/features/portada/components/portada-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nueva foto de portada" };

export default function NuevaPortadaPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin/portada">
        ← Portada
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Nueva foto de portada</h1>
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

  return (
    <PortadaForm
      action={crearPortadaAction}
      defaultValues={{ ocasion: "", frase: "", enlace: "", orden: "0", activa: true }}
      submitLabel="Agregar foto"
    />
  );
}
