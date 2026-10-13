import { Field, SelectField } from "@/components/ui/field";
import { PROVINCIAS, TELEFONO_TIPOS, type DireccionFormValues } from "@/features/direcciones/schemas";

type DireccionCamposProps = {
  values?: DireccionFormValues;
  errors: Partial<Record<keyof DireccionFormValues, string>>;
  // Prefijo de los id (puede haber varios formularios en la misma página).
  idPrefijo?: string;
};

// Campos de una dirección (en "Finalizar compra" y en "Mis direcciones").
// Van dentro de una grilla de 2 columnas (sm:grid-cols-2).
export function DireccionCampos({ values, errors, idPrefijo = "direccion" }: DireccionCamposProps) {
  return (
    <>
      <div className="sm:col-span-2">
        <Field
          autoComplete="street-address"
          defaultValue={values?.calle}
          error={errors.calle}
          id={`${idPrefijo}-calle`}
          label="Calle y número"
          name="calle"
          required
        />
      </div>
      <Field
        defaultValue={values?.barrio}
        error={errors.barrio}
        id={`${idPrefijo}-barrio`}
        label="Barrio"
        name="barrio"
        required
      />
      <Field
        autoComplete="address-level2"
        defaultValue={values?.ciudad}
        error={errors.ciudad}
        id={`${idPrefijo}-ciudad`}
        label="Ciudad"
        name="ciudad"
        required
      />
      <SelectField
        defaultValue={values?.provincia ?? ""}
        error={errors.provincia}
        id={`${idPrefijo}-provincia`}
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
          id={`${idPrefijo}-telefono-tipo`}
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
          id={`${idPrefijo}-telefono`}
          inputMode="tel"
          label="Número"
          name="direccionTelefono"
          required
          type="tel"
        />
      </div>
    </>
  );
}
