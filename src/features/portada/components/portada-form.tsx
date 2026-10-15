"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { ImageField } from "@/components/ui/image-field";
import type { PortadaFormState } from "@/features/portada/actions";
import {
  PORTADA_ALTO,
  PORTADA_ANCHO,
  PORTADA_MOVIL_ALTO,
  PORTADA_MOVIL_ANCHO,
  portadaImagenUrl,
} from "@/features/portada/imagen-size";
import type { PortadaFormValues } from "@/features/portada/schemas";

type PortadaFormProps = {
  action: (state: PortadaFormState, formData: FormData) => Promise<PortadaFormState>;
  defaultValues: PortadaFormValues;
  imagenActual?: string;
  imagenMovilActual?: string | null;
  submitLabel: string;
};

const initialState: PortadaFormState = {};

export function PortadaForm({ action, defaultValues, imagenActual, imagenMovilActual, submitLabel }: PortadaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  // Tras un error se muestran los valores enviados; si no, los iniciales.
  const values = state.values ?? defaultValues;

  return (
    <form action={formAction} className="grid gap-5" key={JSON.stringify(values)}>
      <ImageField
        actual={imagenActual ? portadaImagenUrl(imagenActual) : null}
        alto={PORTADA_ALTO}
        ancho={PORTADA_ANCHO}
        error={errors.imagen}
        label="Foto horizontal (computadoras y tablets)"
        quitable={false}
        uso="horizontal; si no cargás la vertical, en el celular se ve el centro"
      />

      <ImageField
        actual={imagenMovilActual ? portadaImagenUrl(imagenMovilActual) : null}
        alto={PORTADA_MOVIL_ALTO}
        ancho={PORTADA_MOVIL_ANCHO}
        error={errors.imagenMovil}
        label="Foto vertical para celulares (opcional)"
        name="imagenMovil"
        uso="vertical, como una historia de Instagram"
      />

      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field
          defaultValue={values.ocasion}
          error={errors.ocasion}
          hint="Se muestra como etiqueta sobre la foto."
          label="Ocasión"
          maxLength={40}
          name="ocasion"
          placeholder="Cumpleaños"
          required
        />
        <Field
          defaultValue={values.orden}
          error={errors.orden}
          hint="Menor, primero."
          inputMode="numeric"
          label="Orden"
          min={0}
          name="orden"
          type="number"
        />
      </div>

      <Field
        defaultValue={values.frase}
        error={errors.frase}
        hint="Opcional. Una línea corta debajo del título."
        label="Frase"
        maxLength={120}
        name="frase"
        placeholder="Para que su día sea inolvidable"
      />

      <Field
        defaultValue={values.enlace}
        error={errors.enlace}
        hint="Opcional. Con enlace, la foto muestra un botón “Regalos para…” que lleva a esa página. Ej.: /catalogo/plata-900-925"
        label="Enlace"
        maxLength={200}
        name="enlace"
        placeholder="/catalogo/..."
      />

      <label className="flex items-center gap-3 text-sm font-medium">
        <input className="size-5 accent-brand" defaultChecked={values.activa} name="activa" type="checkbox" />
        Visible en la portada
      </label>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold transition hover:bg-brand-soft"
          href="/admin/portada"
        >
          Cancelar
        </Link>
        <Button disabled={isPending} type="submit">
          {isPending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
