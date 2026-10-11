"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { ImageField } from "@/components/ui/image-field";
import type { ProductoFormState } from "@/features/productos/actions";
import { PRODUCTO_IMAGEN_LADO, productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoFormValues } from "@/features/productos/schemas";

type ProductoFormProps = {
  action: (state: ProductoFormState, formData: FormData) => Promise<ProductoFormState>;
  categorias: { id: number; etiqueta: string }[];
  defaultValues: ProductoFormValues;
  imagenActual?: string | null;
  submitLabel: string;
};

const initialState: ProductoFormState = {};

export function ProductoForm({ action, categorias, defaultValues, imagenActual, submitLabel }: ProductoFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  // Tras un error se muestran los valores enviados; si no, los iniciales.
  const values = state.values ?? defaultValues;

  if (categorias.length === 0) {
    return (
      <FormAlert>
        Primero creá al menos una categoría. Los productos van en las categorías sin subcategorías.
      </FormAlert>
    );
  }

  return (
    <form action={formAction} className="grid gap-5" key={JSON.stringify(values)}>
      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <Field
          autoCapitalize="characters"
          defaultValue={values.sku}
          error={errors.sku}
          label="SKU"
          maxLength={40}
          name="sku"
          required
        />
        <Field defaultValue={values.nombre} error={errors.nombre} label="Nombre" maxLength={150} name="nombre" required />
      </div>

      <Field
        defaultValue={values.slug}
        error={errors.slug}
        hint="Dirección web del producto. Si lo dejás vacío, se genera del nombre."
        label="Slug"
        maxLength={170}
        name="slug"
      />

      <SelectField
        defaultValue={values.categoriaId}
        error={errors.categoriaId}
        hint="Solo se listan las categorías sin subcategorías."
        label="Categoría"
        name="categoriaId"
        required
      >
        <option value="">— Elegí una categoría —</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.etiqueta}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          defaultValue={values.precioCosto}
          error={errors.precioCosto}
          hint="Interno: no se muestra en la tienda."
          inputMode="decimal"
          label="Precio de costo ($)"
          name="precioCosto"
          placeholder="8.500"
          required
        />
        <Field
          defaultValue={values.precioVenta}
          error={errors.precioVenta}
          inputMode="decimal"
          label="Precio de venta ($)"
          name="precioVenta"
          placeholder="12.500"
          required
        />
      </div>

      <ImageField
        actual={productoImagenUrl(imagenActual ?? null)}
        alto={PRODUCTO_IMAGEN_LADO}
        ancho={PRODUCTO_IMAGEN_LADO}
        error={errors.imagen}
        uso="cuadrada"
      />

      <div className="grid gap-3">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input className="size-5 accent-brand" defaultChecked={values.activo} name="activo" type="checkbox" />
          Visible en la tienda
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input className="size-5 accent-brand" defaultChecked={values.destacado} name="destacado" type="checkbox" />
          Destacado
        </label>
      </div>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold transition hover:bg-brand-soft"
          href="/admin/productos"
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
