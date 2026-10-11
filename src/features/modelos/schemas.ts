import { z } from "zod";

// Sugerencias para "qué varía" (se puede escribir otra).
export const VARIACIONES_SUGERIDAS = ["Color", "Tamaño", "Largo", "Material", "Medida", "Presentación", "Modelo"];

const varianteSchema = z.object({
  productoId: z.coerce.number().int().positive(),
  variante: z.string().trim().max(60),
  orden: z.coerce.number().int().min(0).max(999),
  quitar: z.boolean(),
});

export const modeloSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresá el nombre del modelo.").max(150),
    variacion: z.string().trim().min(1, "Indicá qué varía (ej. Color).").max(40),
    variantes: z.array(varianteSchema),
  })
  .superRefine((data, ctx) => {
    const quedan = data.variantes.filter((v) => !v.quitar);

    if (quedan.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["variantes"],
        message: "Un modelo necesita al menos 2 productos. Para separarlos todos, usá Desagrupar.",
      });
    }

    const vistas = new Set<string>();

    for (const v of quedan) {
      if (!v.variante) {
        ctx.addIssue({ code: "custom", path: [`variante-${v.productoId}`], message: "Escribí la variante." });
        continue;
      }

      const clave = v.variante.toLowerCase();

      if (vistas.has(clave)) {
        ctx.addIssue({ code: "custom", path: [`variante-${v.productoId}`], message: "Ya hay otra variante con ese nombre." });
      }

      vistas.add(clave);
    }
  });

export type ModeloInput = z.output<typeof modeloSchema>;

// Valores del formulario, para reponerlos si hay errores.
export type ModeloFormValues = {
  nombre: string;
  variacion: string;
  variantes: Record<number, { variante: string; orden: string; quitar: boolean }>;
};

// El formulario manda "productoId" repetido y, por cada uno,
// "variante-<id>", "orden-<id>" y "quitar-<id>".
export function leerModeloForm(formData: FormData) {
  const ids = formData.getAll("productoId").map(String);
  const values: ModeloFormValues = {
    nombre: String(formData.get("nombre") ?? ""),
    variacion: String(formData.get("variacion") ?? ""),
    variantes: Object.fromEntries(
      ids.map((id) => [
        Number(id),
        {
          variante: String(formData.get(`variante-${id}`) ?? ""),
          orden: String(formData.get(`orden-${id}`) ?? "0"),
          quitar: formData.get(`quitar-${id}`) === "on",
        },
      ]),
    ),
  };
  const parsed = modeloSchema.safeParse({
    nombre: values.nombre,
    variacion: values.variacion,
    variantes: ids.map((id) => ({ productoId: id, ...values.variantes[Number(id)] })),
  });

  return { values, parsed };
}

export const modeloIdSchema = z.coerce.number().int().positive();
