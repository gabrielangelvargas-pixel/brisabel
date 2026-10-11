import type { Metadata } from "next";

import { AuthTabs } from "@/features/auth/components/auth-tabs";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <h1 className="text-2xl font-semibold">Tu cuenta</h1>
      <p className="mt-2 text-sm text-muted">Ingresá o creá tu cuenta para comprar más rápido.</p>
      <div className="mt-8">
        <AuthTabs />
      </div>
    </main>
  );
}
