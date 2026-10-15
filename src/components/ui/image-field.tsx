import Image from "next/image";

type ImageFieldProps = {
  // URL de la imagen actual (al editar), o null si no tiene.
  actual: string | null;
  error?: string;
  ancho: number;
  alto: number;
  // Para qué se usa la imagen, se agrega a la ayuda.
  uso?: string;
  // false: la imagen es obligatoria (no se ofrece "Quitar imagen").
  quitable?: boolean;
  // Para más de una imagen en el mismo formulario.
  label?: string;
  name?: string;
};

// Campo de imagen para formularios del panel: muestra la actual y permite
// reemplazarla (name, por defecto "imagen") o quitarla ("quitar" + name con
// mayúscula, por defecto "quitarImagen").
export function ImageField({
  actual,
  error,
  ancho,
  alto,
  uso,
  quitable = true,
  label = "Imagen",
  name = "imagen",
}: ImageFieldProps) {
  const proporcion = { aspectRatio: `${ancho} / ${alto}` };
  const nombreQuitar = `quitar${name[0].toUpperCase()}${name.slice(1)}`;
  const mensajeId = `${name}-message`;
  // Las verticales se muestran más angostas.
  const anchoVista = ancho >= alto ? "w-40" : "w-24";

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium">{label}</legend>

      {actual ? (
        <div className="flex flex-wrap items-end gap-4">
          <Image
            alt={`${label} actual`}
            className={`${anchoVista} rounded-md border border-line object-cover`}
            height={alto}
            src={actual}
            style={proporcion}
            unoptimized
            width={ancho}
          />
          {quitable ? (
            <label className="flex items-center gap-2 text-sm">
              <input className="size-4 accent-accent" name={nombreQuitar} type="checkbox" />
              Quitar imagen
            </label>
          ) : null}
        </div>
      ) : null}

      <input
        accept="image/jpeg,image/png,image/webp"
        aria-describedby={mensajeId}
        aria-invalid={error ? true : undefined}
        className="block w-full text-sm file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-brand-soft file:px-4 file:text-sm file:font-semibold file:text-brand hover:file:bg-line"
        id={name}
        name={name}
        type="file"
      />
      <p className={error ? "text-xs text-accent" : "text-xs text-muted"} id={mensajeId}>
        {error ??
          `${actual ? "Elegí un archivo solo si querés reemplazarla. " : ""}JPG, PNG o WebP, hasta 8 MB. Se recorta a ${ancho}×${alto}${uso ? ` (${uso})` : ""}.`}
      </p>
    </fieldset>
  );
}
