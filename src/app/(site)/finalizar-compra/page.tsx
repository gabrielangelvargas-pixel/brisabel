import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { FinalizarCompra } from "@/features/pedidos/components/finalizar-compra";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default function FinalizarCompraPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:py-12">
      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

// Sin sesión: a ingresar, y después de ingresar o crear la cuenta se vuelve acá.
async function Contenido() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/ingresar?volver=/finalizar-compra");
  }

  return <FinalizarCompra nombreUsuario={usuario.nombre} />;
}
