import Image from "next/image";

type ImageFieldProps = {
  // URL de la imagen actual (al editar), o null si no tiene.
  actual: string | null;
  error?: string;
  ancho: number;
  alto: number;
  // Para qué se usa la imagen, se agrega a la ayuda.
  uso?: string;
};

// Campo de imagen para formularios del panel: muestra la actual y permite
// reemplazarla (name="imagen") o quitarla (name="quitarImagen").
export function ImageField({ actual, error, ancho, alto, uso }: ImageFieldProps) {
  const proporcion = { aspectRatio: `${ancho} / ${alto}` };

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium">Imagen</legend>

      {actual ? (
        <div className="flex flex-wrap items-end gap-4">
          <Image
            alt="Imagen actual"
            className="w-40 rounded-md border border-line object-cover"
            height={alto}
            src={actual}
            style={proporcion}
            unoptimized
            width={ancho}
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
          `${actual ? "Elegí un archivo solo si querés reemplazarla. " : ""}JPG, PNG o WebP, hasta 8 MB. Se recorta a ${ancho}×${alto}${uso ? ` (${uso})` : ""}.`}
      </p>
    </fieldset>
  );
}
