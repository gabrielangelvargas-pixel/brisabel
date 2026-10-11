"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import type { CategoriaFormState } from "@/features/categorias/actions";
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

      <ImagenField actual={categoriaImagenUrl(defaultValues?.imagen ?? null)} error={errors.imagen} />

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

// Imagen de la categoría: muestra la actual y permite reemplazarla o quitarla.
function ImagenField({ actual, error }: { actual: string | null; error?: string }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium">Imagen</legend>

      {actual ? (
        <div className="flex flex-wrap items-end gap-4">
          <Image
            alt="Imagen actual de la categoría"
            className="aspect-[1200/630] w-60 rounded-md border border-line object-cover"
            height={630}
            src={actual}
            unoptimized
            width={1200}
          />
          <label className="flex items-center gap-2 text-sm">
            <input className="size-4 accent-accent" name="quitarImagen" type="checkbox" />
            Quitar imagen
          </label>
        </div>
      ) : null}

      <input
        accept="image/jpeg,image/png,image/webp"
        aria-describedby="imagen-message"
        aria-invalid={error ? true : undefined}
        className="block w-full text-sm file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-brand-soft file:px-4 file:text-sm file:font-semibold file:text-brand hover:file:bg-line"
        id="imagen"
        name="imagen"
        type="file"
      />
      <p className={error ? "text-xs text-accent" : "text-xs text-muted"} id="imagen-message">
        {error ??
          (actual ? "Elegí un archivo solo si querés reemplazarla. " : "") +
            "JPG, PNG o WebP, hasta 8 MB. Se recorta a 1200×630 (formato para compartir en redes)."}
      </p>
    </fieldset>
  );
}
