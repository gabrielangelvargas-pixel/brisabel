"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { registroAction, type RegistroState } from "@/features/auth/actions";

const initialState: RegistroState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registroAction, initialState);
  const errors = state.fieldErrors ?? {};
  // Remonta los campos con los valores devueltos tras un error.
  const formKey = JSON.stringify(state.values ?? {});

  return (
    <form action={formAction} className="grid gap-5" key={formKey}>
      <Field
        autoComplete="name"
        defaultValue={state.values?.nombre}
        error={errors.nombre}
        id="registro-nombre"
        label="Nombre y apellido"
        name="nombre"
        required
      />
      <Field
        autoCapitalize="none"
        autoComplete="username"
        defaultValue={state.values?.username}
        error={errors.username}
        hint="Letras, números, punto o guion. Lo vas a usar para ingresar."
        id="registro-username"
        label="Nombre de usuario"
        name="username"
        required
      />
      <Field
        defaultValue={state.values?.dni}
        error={errors.dni}
        hint="Opcional. También vas a poder ingresar con tu DNI."
        id="registro-dni"
        inputMode="numeric"
        label="DNI"
        name="dni"
      />
      <Field
        autoComplete="new-password"
        error={errors.password}
        hint="Mínimo 8 caracteres."
        id="registro-password"
        label="Contraseña"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <Field
        autoComplete="new-password"
        error={errors.confirmacion}
        id="registro-confirmacion"
        label="Repetir contraseña"
        name="confirmacion"
        required
        type="password"
      />

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
