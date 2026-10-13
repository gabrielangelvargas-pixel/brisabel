"use client";

import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { FormAlert } from "@/components/ui/form-alert";
import { eliminarDireccionAction, guardarDireccionAction, type DireccionState } from "@/features/direcciones/actions";
import { DireccionCampos } from "@/features/direcciones/components/direccion-campos";
import type { DireccionGuardada } from "@/features/direcciones/queries";
import { TELEFONO_TIPOS } from "@/features/direcciones/schemas";

const botonIcono =
  "inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-brand-soft hover:text-brand";

// "Mis direcciones" en Mi cuenta: agregar, editar en el lugar y borrar.
export function MisDirecciones({ direcciones }: { direcciones: DireccionGuardada[] }) {
  // id de la dirección que se edita, "nueva" o null (ninguna).
  const [editando, setEditando] = useState<number | "nueva" | null>(null);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Mis direcciones</h2>
        {editando !== "nueva" ? (
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
            onClick={() => setEditando("nueva")}
            type="button"
          >
            <Plus className="size-4" />
            Agregar
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3">
        {editando === "nueva" ? <DireccionForm onCerrar={() => setEditando(null)} /> : null}

        {direcciones.length === 0 && editando !== "nueva" ? (
          <p className="text-sm text-muted">Todavía no guardaste direcciones. Se guardan al comprar con envío o desde acá.</p>
        ) : null}

        {direcciones.map((direccion) =>
          editando === direccion.id ? (
            <DireccionForm direccion={direccion} key={direccion.id} onCerrar={() => setEditando(null)} />
          ) : (
            <div className="flex gap-3 rounded-lg border border-line bg-surface p-4 text-sm" key={direccion.id}>
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{direccion.calle}</p>
                <p className="text-muted">
                  {direccion.barrio}, {direccion.ciudad}, {direccion.provincia}
                </p>
                <p className="text-xs text-muted">
                  {TELEFONO_TIPOS[direccion.telefonoTipo]}: {direccion.telefono}
                </p>
              </div>
              <div className="-mt-1 -mr-1 flex shrink-0">
                <button
                  aria-label={`Editar ${direccion.calle}`}
                  className={botonIcono}
                  onClick={() => setEditando(direccion.id)}
                  type="button"
                >
                  <Pencil className="size-4" />
                </button>
                <form action={eliminarDireccionAction}>
                  <input name="id" type="hidden" value={direccion.id} />
                  <ConfirmSubmitButton
                    aria-label={`Eliminar ${direccion.calle}`}
                    className={`${botonIcono} hover:bg-accent-soft hover:text-accent`}
                    message={`¿Eliminar la dirección ${direccion.calle}?`}
                  >
                    <Trash2 className="size-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function DireccionForm({ direccion, onCerrar }: { direccion?: DireccionGuardada; onCerrar: () => void }) {
  const [state, formAction, isPending] = useActionState(async (prev: DireccionState, formData: FormData) => {
    const resultado = await guardarDireccionAction(prev, formData);
    if (resultado.ok) onCerrar();
    return resultado;
  }, {});
  const values = state.values ?? (direccion ? { ...direccion, direccionTelefono: direccion.telefono } : undefined);
  const idPrefijo = `direccion-${direccion?.id ?? "nueva"}`;

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-brand/30 bg-surface p-4 sm:grid-cols-2"
      key={JSON.stringify(state.values ?? {})}
    >
      <p className="font-semibold sm:col-span-2">{direccion ? "Editar dirección" : "Nueva dirección"}</p>
      {direccion ? <input name="id" type="hidden" value={direccion.id} /> : null}
      <DireccionCampos errors={state.fieldErrors ?? {}} idPrefijo={idPrefijo} values={values} />

      {state.error ? (
        <div className="sm:col-span-2">
          <FormAlert>{state.error}</FormAlert>
        </div>
      ) : null}

      <div className="flex gap-2 sm:col-span-2">
        <Button disabled={isPending} type="submit">
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
        <Button onClick={onCerrar} type="button" variant="outline">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
