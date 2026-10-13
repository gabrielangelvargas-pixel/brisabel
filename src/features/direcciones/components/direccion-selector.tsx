"use client";

import { MapPin, Plus } from "lucide-react";
import { useState } from "react";

import { Field, SelectField } from "@/components/ui/field";
import type { DireccionGuardada } from "@/features/direcciones/queries";
import { PROVINCIAS, TELEFONO_TIPOS } from "@/features/direcciones/schemas";
import { cn } from "@/lib/cn";

type Campos = "direccionId" | "calle" | "barrio" | "ciudad" | "provincia" | "telefonoTipo" | "direccionTelefono";

type DireccionSelectorProps = {
  direcciones: DireccionGuardada[];
  values?: Partial<Record<Campos, string>>;
  errors: Partial<Record<Campos, string>>;
};

const opcionClass = "flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition";

// Envío a domicilio: elegir una dirección guardada o cargar una nueva (que se
// guarda al confirmar el pedido). Sin direcciones guardadas, va directo al formulario.
export function DireccionSelector({ direcciones, values, errors }: DireccionSelectorProps) {
  const [elegida, setElegida] = useState(values?.direccionId || String(direcciones[0]?.id ?? "nueva"));

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-sm font-medium">Dirección de entrega</legend>

      {direcciones.length > 0 ? (
        <div className="grid gap-2">
          {direcciones.map((direccion) => {
            const valor = String(direccion.id);

            return (
              <label
                className={cn(
                  opcionClass,
                  elegida === valor ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40",
                )}
                key={direccion.id}
              >
                <input
                  checked={elegida === valor}
                  className="mt-0.5 accent-brand"
                  name="direccionId"
                  onChange={() => setElegida(valor)}
                  type="radio"
                  value={valor}
                />
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block font-medium">{direccion.calle}</span>
                  <span className="block text-muted">
                    {direccion.barrio}, {direccion.ciudad}, {direccion.provincia}
                  </span>
                  <span className="block text-xs text-muted">
                    {TELEFONO_TIPOS[direccion.telefonoTipo]}: {direccion.telefono}
                  </span>
                </span>
              </label>
            );
          })}
          <label
            className={cn(
              opcionClass,
              "items-center font-medium",
              elegida === "nueva" ? "border-brand bg-brand-soft text-brand" : "border-line hover:border-brand/40",
            )}
          >
            <input
              checked={elegida === "nueva"}
              className="accent-brand"
              name="direccionId"
              onChange={() => setElegida("nueva")}
              type="radio"
              value="nueva"
            />
            <Plus className="size-4" />
            Nueva dirección
          </label>
        </div>
      ) : (
        <input name="direccionId" type="hidden" value="nueva" />
      )}
      {errors.direccionId ? <p className="text-xs text-accent">{errors.direccionId}</p> : null}

      {elegida === "nueva" ? (
        <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              autoComplete="street-address"
              defaultValue={values?.calle}
              error={errors.calle}
              id="direccion-calle"
              label="Calle y número"
              name="calle"
              required
            />
          </div>
          <Field defaultValue={values?.barrio} error={errors.barrio} id="direccion-barrio" label="Barrio" name="barrio" required />
          <Field
            autoComplete="address-level2"
            defaultValue={values?.ciudad}
            error={errors.ciudad}
            id="direccion-ciudad"
            label="Ciudad"
            name="ciudad"
            required
          />
          <SelectField
            defaultValue={values?.provincia ?? ""}
            error={errors.provincia}
            id="direccion-provincia"
            label="Provincia"
            name="provincia"
            required
          >
            <option disabled value="">
              Elegí la provincia
            </option>
            {PROVINCIAS.map((provincia) => (
              <option key={provincia} value={provincia}>
                {provincia}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-[7rem_1fr] gap-2">
            <SelectField
              defaultValue={values?.telefonoTipo || "CELULAR"}
              error={errors.telefonoTipo}
              id="direccion-telefono-tipo"
              label="Teléfono"
              name="telefonoTipo"
            >
              {Object.entries(TELEFONO_TIPOS).map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </SelectField>
            <Field
              autoComplete="tel"
              defaultValue={values?.direccionTelefono}
              error={errors.direccionTelefono}
              id="direccion-telefono"
              inputMode="tel"
              label="Número"
              name="direccionTelefono"
              required
              type="tel"
            />
          </div>
          <p className="text-xs text-muted sm:col-span-2">La guardamos en tu cuenta para tus próximas compras.</p>
        </div>
      ) : null}
    </fieldset>
  );
}
