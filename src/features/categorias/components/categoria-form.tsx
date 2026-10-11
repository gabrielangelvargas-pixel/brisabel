"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { ImageField } from "@/components/ui/image-field";
import type { CategoriaFormState } from "@/features/categorias/actions";
import { IMAGEN_ALTO, IMAGEN_ANCHO } from "@/features/categorias/imagen-size";
import { categoriaImagenUrl } from "@/features/categorias/tree";

type PadreOpcion = { id: number; nombre: string; nivel: number };

type CategoriaFormProps = {
  action: (state: CategoriaFormState, formData: FormData) => Promise<CategoriaFormState>;
  padres: PadreOpcion[];
  defaultValues?: {
    nombre: string;
    slug: string;
    descripcion: string | null;
    imagen?: string | null;
    parentId: number | null;
    activa: boolean;
  };
  submitLabel: string;
};

const initialState: CategoriaFormState = {};

export function CategoriaForm({ action, padres, defaultValues, submitLabel }: CategoriaFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  // Tras un error se muestran los valores enviados; si no, los iniciales.
  const values = state.values ?? {
    nombre: defaultValues?.nombre ?? "",
    slug: defaultValues?.slug ?? "",
    descripcion: defaultValues?.descripcion ?? "",
    parentId: defaultValues?.parentId?.toString() ?? "",
    activa: defaultValues?.activa ?? true,
  };

  return (
    <form action={formAction} className="grid gap-5" key={JSON.stringify(values)}>
      <Field
        defaultValue={values.nombre}
        error={errors.nombre}
        label="Nombre"
        maxLength={80}
        name="nombre"
        required
      />
      <Field
        defaultValue={values.slug}
        error={errors.slug}
        hint="Se usa en la dirección web (/catalogo/aros-de-plata). Si lo dejás vacío, se genera del nombre."
        label="Slug"
        maxLength={100}
        name="slug"
      />
      <SelectField
        defaultValue={values.parentId}
        error={errors.parentId}
        hint="Hasta 3 niveles: categoría › subcategoría › sub-subcategoría."
        label="Categoría padre"
        name="parentId"
      >
        <option value="">— Ninguna (categoría principal) —</option>
        {padres.map((padre) => (
          <option key={padre.id} value={padre.id}>
            {`${"   ".repeat(padre.nivel)}${padre.nivel > 0 ? "› " : ""}${padre.nombre}`}
          </option>
        ))}
      </SelectField>
      <TextareaField
        defaultValue={values.descripcion}
        error={errors.descripcion}
        label="Descripción"
        maxLength={300}
        name="descripcion"
      />

      <ImageField
        actual={categoriaImagenUrl(defaultValues?.imagen ?? null)}
        alto={IMAGEN_ALTO}
        ancho={IMAGEN_ANCHO}
        error={errors.imagen}
        uso="formato para compartir en redes"
      />

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          className="size-5 rounded border-line accent-brand"
          defaultChecked={values.activa}
          name="activa"
          type="checkbox"
        />
        Visible en la tienda
      </label>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold transition hover:bg-brand-soft"
          href="/admin/categorias"
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
