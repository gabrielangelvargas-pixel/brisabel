import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-3xl font-semibold">Mi cuenta</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Cargando...</p>}>
        <ProfileDetails />
      </Suspense>
    </main>
  );
}

async function ProfileDetails() {
  const user = await requireUser();

  return (
    <>
      <dl className="mt-6 grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Nombre</dt>
          <dd className="mt-1">{user.nombre}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Usuario</dt>
          <dd className="mt-1">{user.username}</dd>
        </div>
      </dl>

      <form action={logoutAction} className="mt-6">
        <Button type="submit" variant="outline">
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </form>
    </>
  );
}
