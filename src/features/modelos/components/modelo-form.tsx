"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import type { ModeloFormState } from "@/features/modelos/actions";
import { VARIACIONES_SUGERIDAS, type ModeloFormValues } from "@/features/modelos/schemas";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { formatPrecio } from "@/lib/format";

export type ProductoDelModelo = {
  id: number;
  sku: string;
  nombre: string;
  imagen: string | null;
  precioVenta: string;
};

type ModeloFormProps = {
  action: (state: ModeloFormState, formData: FormData) => Promise<ModeloFormState>;
  productos: ProductoDelModelo[];
  defaultValues: ModeloFormValues;
  // Al editar se puede quitar productos del modelo.
  permitirQuitar?: boolean;
  submitLabel: string;
};

const initialState: ModeloFormState = {};

export function ModeloForm({ action, productos, defaultValues, permitirQuitar = false, submitLabel }: ModeloFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? defaultValues;

  return (
    <form action={formAction} className="grid gap-6" key={JSON.stringify(values)}>
      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <Field
          defaultValue={values.nombre}
          error={errors.nombre}
          hint="Es el nombre que se ve en la tarjeta de la tienda."
          label="Nombre del modelo"
          maxLength={150}
          name="nombre"
          required
        />
        <Field
          defaultValue={values.variacion}
          error={errors.variacion}
          hint="Qué cambia entre los productos."
          label="Varía por"
          list="variaciones-sugeridas"
          maxLength={40}
          name="variacion"
          required
        />
        <datalist id="variaciones-sugeridas">
          {VARIACIONES_SUGERIDAS.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Variantes</legend>
        <p className="-mt-1 text-xs text-muted">
          Escribí cómo se llama cada variante (ej. Negro, Chico, 45 cm). El orden define cómo aparecen en la tarjeta.
        </p>

        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {productos.map((producto) => {
            const valor = values.variantes[producto.id] ?? { variante: "", orden: "0", quitar: false };
            const error = errors[`variante-${producto.id}`];
            const imagenUrl = productoImagenUrl(producto.imagen);

            return (
              <li className="grid gap-3 p-3 sm:grid-cols-[auto_1fr_10rem_5rem] sm:items-center" key={producto.id}>
                <input name="productoId" type="hidden" value={producto.id} />
                <div className="flex items-center gap-3 sm:contents">
                  {imagenUrl ? (
                    <Image
                      alt=""
                      className="size-12 shrink-0 rounded border border-line object-cover"
                      height={96}
                      src={imagenUrl}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded border border-dashed border-line text-muted">
                      <ImageOff className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{producto.nombre}</p>
                    <p className="truncate text-xs text-muted">
                      {producto.sku} · {formatPrecio(producto.precioVenta)}
                    </p>
                    {permitirQuitar ? (
                      <label className="mt-1 flex items-center gap-2 text-xs text-accent">
                        <input className="size-3.5 accent-accent" defaultChecked={valor.quitar} name={`quitar-${producto.id}`} type="checkbox" />
                        Quitar del modelo
                      </label>
                    ) : null}
                  </div>
                </div>
                <label className="grid gap-1 text-xs font-medium">
                  Variante
                  <input
                    aria-invalid={error ? true : undefined}
                    className={`h-10 rounded-md border bg-surface px-3 text-sm outline-none focus:ring-2 ${error ? "border-accent focus:ring-accent/20" : "border-line focus:border-brand focus:ring-brand/20"}`}
                    defaultValue={valor.variante}
                    maxLength={60}
                    name={`variante-${producto.id}`}
                    placeholder="Ej. Negro"
                  />
                  {error ? <span className="font-normal text-accent">{error}</span> : null}
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Orden
                  <input
                    className="h-10 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    defaultValue={valor.orden}
                    inputMode="numeric"
                    max={999}
                    min={0}
                    name={`orden-${producto.id}`}
                    type="number"
                  />
                </label>
              </li>
            );
          })}
        </ul>
        {errors.variantes ? <FormAlert>{errors.variantes}</FormAlert> : null}
      </fieldset>

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
