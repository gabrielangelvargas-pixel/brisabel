"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium">
        Usuario o DNI
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="h-11 rounded-md border border-line bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          defaultValue={state.identificador}
          key={state.identificador}
          name="identificador"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Contraseña
        <input
          autoComplete="current-password"
          className="h-11 rounded-md border border-line bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          name="password"
          required
          type="password"
        />
      </label>

      {state.error ? (
        <p
          className="rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <button
        className="h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
