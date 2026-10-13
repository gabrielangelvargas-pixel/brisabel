import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthTabs } from "@/features/auth/components/auth-tabs";
import { volverSeguro } from "@/lib/auth/volver";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default function LoginPage({ searchParams }: PageProps<"/ingresar">) {
  return (
    // Alineado arriba (no centrado): así el título no se mueve al cambiar de
    // ficha, aunque los formularios tengan distinta altura.
    <main className="mx-auto w-full max-w-sm flex-1 px-5 pt-10 pb-16 sm:pt-16">
      <h1 className="text-2xl font-semibold">Tu cuenta</h1>
      <Suspense fallback={<Intro />}>
        <Acceso searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function Intro({ paraComprar = false }: { paraComprar?: boolean }) {
  return (
    <p className="mt-2 text-sm text-muted">
      {paraComprar
        ? "Para finalizar tu compra, ingresá o creá tu cuenta. Tu carrito te espera."
        : "Ingresá o creá tu cuenta para comprar más rápido."}
    </p>
  );
}

// ?volver=/finalizar-compra: al ingresar o crear la cuenta se sigue desde ahí.
async function Acceso({ searchParams }: Pick<PageProps<"/ingresar">, "searchParams">) {
  const volver = volverSeguro((await searchParams).volver) ?? undefined;

  return (
    <>
      <Intro paraComprar={volver === "/finalizar-compra"} />
      <div className="mt-8">
        <AuthTabs volver={volver} />
      </div>
    </>
  );
}
