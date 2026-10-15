import { z } from "zod";

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((valor) => valor || null);

export const portadaSchema = z.object({
  ocasion: z.string().trim().min(2, "Ingresá la ocasión (ej. Cumpleaños).").max(40, "Máximo 40 caracteres."),
  frase: opcional(120),
  // Solo rutas del sitio ("/catalogo/plata"), nunca otros dominios.
  enlace: opcional(200).refine((valor) => valor === null || (valor.startsWith("/") && !valor.startsWith("//")), {
    message: "Usá una dirección del sitio que empiece con / (ej. /catalogo/plata).",
  }),
  orden: z.coerce.number({ error: "Ingresá un número." }).int("Ingresá un número entero.").min(0).max(999),
  activa: z.boolean(),
});

export type PortadaInput = z.output<typeof portadaSchema>;

export type PortadaFormValues = {
  ocasion: string;
  frase: string;
  enlace: string;
  orden: string;
  activa: boolean;
};

export function portadaFormValues(formData: FormData): PortadaFormValues {
  const texto = (campo: string) => String(formData.get(campo) ?? "");

  return {
    ocasion: texto("ocasion"),
    frase: texto("frase"),
    enlace: texto("enlace"),
    orden: texto("orden") || "0",
    activa: formData.get("activa") === "on",
  };
}

export const portadaIdSchema = z.coerce.number().int().positive();
