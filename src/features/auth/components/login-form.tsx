"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { loginAction, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = {};

// volver: página a la que ir después (ej. "/finalizar-compra").
export function LoginForm({ volver }: { volver?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      {volver ? <input name="volver" type="hidden" value={volver} /> : null}
      <Field
        autoCapitalize="none"
        autoComplete="username"
        defaultValue={state.identificador}
        id="login-identificador"
        key={state.identificador}
        label="Usuario o DNI"
        name="identificador"
        required
      />
      <Field
        autoComplete="current-password"
        id="login-password"
        label="Contraseña"
        name="password"
        required
        type="password"
      />

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
