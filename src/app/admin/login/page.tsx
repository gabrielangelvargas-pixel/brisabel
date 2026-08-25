import Link from "next/link";

import { loginAction } from "@/app/admin/login/actions";
import { appConfig } from "@/config/app";

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-5 py-12 text-[#1f2320]">
      <section className="w-full max-w-md rounded-lg border border-[#e1d8cc] bg-white p-6 shadow-sm">
        <Link className="text-xl font-semibold" href="/">
          {appConfig.name}
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Ingresar al panel</h1>
        <p className="mt-2 text-sm leading-6 text-[#69625b]">
          Acceso reservado para administradores.
        </p>

        {error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No pudimos validar esos datos. Revisalos e intenta nuevamente.
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            DNI
            <input
              autoComplete="username"
              className="h-11 rounded-md border border-[#d8cbbd] px-3 outline-none transition focus:border-[#7f4f3a]"
              inputMode="numeric"
              name="dni"
              pattern="[0-9. -]+"
              required
              type="text"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Contrasena
            <input
              className="h-11 rounded-md border border-[#d8cbbd] px-3 outline-none transition focus:border-[#7f4f3a]"
              name="password"
              required
              type="password"
            />
          </label>
          <button className="mt-2 h-11 rounded-md bg-[#7f4f3a] text-sm font-semibold text-white transition hover:bg-[#6a412f]">
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
