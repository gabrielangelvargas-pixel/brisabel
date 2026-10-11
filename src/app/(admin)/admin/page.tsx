import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/session";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
      <Suspense fallback={<p className="text-muted">Cargando...</p>}>
        <AdminHome />
      </Suspense>
    </main>
  );
}

async function AdminHome() {
  const user = await requireAdmin();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Panel de administración
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Hola, {user.nombre}</h1>
      <p className="mt-2 text-muted">
        Desde acá vas a administrar la tienda. Las secciones se agregan a medida
        que las construyamos.
      </p>
    </>
  );
}
