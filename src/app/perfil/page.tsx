import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { appConfig } from "@/config/app";

export const metadata: Metadata = {
  title: `Perfil - ${appConfig.name}`,
  description: "Acceso al perfil de cliente de Brisabel.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf8] px-5 pb-28 pt-8 text-[#1f2320] sm:px-8 lg:px-10">
      <section className="mx-auto flex max-w-2xl flex-col">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#98715c]">
          Perfil
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          Tu cuenta en Brisabel
        </h1>
        <div className="mt-8 rounded-lg border border-[#e1d8cc] bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#f2e4db] text-[#7f4f3a]">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Perfil de cliente</h2>
          <p className="mt-3 text-sm leading-6 text-[#69625b]">
            Este espacio queda preparado para iniciar sesion, consultar datos,
            guardar preferencias y revisar compras cuando activemos el modulo
            de clientes.
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#7f4f3a] px-5 text-sm font-semibold text-white transition hover:bg-[#6a412f]"
            href="/admin/login"
          >
            Acceso administrativo
            <LogIn className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
