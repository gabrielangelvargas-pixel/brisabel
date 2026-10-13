"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { actualizarPerfilAction, type PerfilState } from "@/features/cuenta/actions";

type PerfilDatosProps = { nombre: string; username: string; dni: string | null };

const etiqueta = "text-xs font-semibold tracking-[0.12em] text-accent uppercase";

// Datos de la cuenta con edición en el lugar: nombre y usuario se editan; el
// DNI es de solo lectura.
export function PerfilDatos({ nombre, username, dni }: PerfilDatosProps) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, isPending] = useActionState(async (prev: PerfilState, formData: FormData) => {
    const resultado = await actualizarPerfilAction(prev, formData);
    if (resultado.ok) setEditando(false);
    return resultado;
  }, {});

  if (!editando) {
    return (
      <section className="relative mt-6 rounded-lg border border-line bg-surface p-5">
        <button
          aria-label="Editar mis datos"
          className="absolute top-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          onClick={() => setEditando(true)}
          type="button"
        >
          <Pencil className="size-4" />
          Editar
        </button>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className={etiqueta}>Nombre</dt>
            <dd className="mt-1">{nombre}</dd>
          </div>
          <div>
            <dt className={etiqueta}>Usuario</dt>
            <dd className="mt-1">{username}</dd>
          </div>
          <div>
            <dt className={etiqueta}>Documento</dt>
            <dd className="mt-1">{dni ?? <span className="text-muted">No informado</span>}</dd>
          </div>
        </dl>
        {state.ok ? (
          <p className="mt-4 text-sm text-brand" role="status">
            Datos guardados.
          </p>
        ) : null}
      </section>
    );
  }

  const values = state.values;
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="mt-6 grid gap-4 rounded-lg border border-brand/30 bg-surface p-5 sm:grid-cols-3"
      key={JSON.stringify(values ?? {})}
    >
      <Field
        autoComplete="name"
        defaultValue={values?.nombre ?? nombre}
        error={errors.nombre}
        id="perfil-nombre"
        label="Nombre"
        name="nombre"
        required
      />
      <Field
        autoCapitalize="none"
        autoComplete="username"
        defaultValue={values?.username ?? username}
        error={errors.username}
        hint="Lo usás para ingresar."
        id="perfil-username"
        label="Usuario"
        name="username"
        required
      />
      <Field
        className="bg-canvas text-muted"
        defaultValue={dni ?? "No informado"}
        hint="No se puede modificar."
        id="perfil-dni"
        label="Documento"
        readOnly
      />

      {state.error ? (
        <div className="sm:col-span-3">
          <FormAlert>{state.error}</FormAlert>
        </div>
      ) : null}

      <div className="flex gap-2 sm:col-span-3">
        <Button disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
        <Button onClick={() => setEditando(false)} type="button" variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
