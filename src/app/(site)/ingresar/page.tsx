import type { Metadata } from "next";

import { AuthTabs } from "@/features/auth/components/auth-tabs";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    // Alineado arriba (no centrado): así el título no se mueve al cambiar de
    // ficha, aunque los formularios tengan distinta altura.
    <main className="mx-auto w-full max-w-sm flex-1 px-5 pt-10 pb-16 sm:pt-16">
      <h1 className="text-2xl font-semibold">Tu cuenta</h1>
      <p className="mt-2 text-sm text-muted">Ingresá o creá tu cuenta para comprar más rápido.</p>
      <div className="mt-8">
        <AuthTabs />
      </div>
    </main>
  );
}
