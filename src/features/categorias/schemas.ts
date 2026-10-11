import { z } from "zod";

import { slugify } from "@/features/categorias/tree";

export const categoriaSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresá un nombre.").max(80),
    // Opcional: si queda vacío se genera a partir del nombre.
    slug: z.string().trim().max(100),
    descripcion: z
      .string()
      .trim()
      .max(300, "Máximo 300 caracteres.")
      .transform((value) => value || null),
    parentId: z
      .string()
      .transform((value) => (value ? Number(value) : null))
      .pipe(z.number().int().positive().nullable()),
    activa: z.boolean(),
  })
  .transform((data) => ({ ...data, slug: slugify(data.slug || data.nombre) }))
  .refine((data) => data.slug.length >= 2, {
    message: "El nombre o el slug deben tener letras o números.",
    path: ["slug"],
  });

export type CategoriaInput = z.output<typeof categoriaSchema>;

export function parseCategoriaForm(formData: FormData) {
  return categoriaSchema.safeParse({
    nombre: String(formData.get("nombre") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    parentId: String(formData.get("parentId") ?? ""),
    activa: formData.get("activa") === "on",
  });
}

export const categoriaIdSchema = z.coerce.number().int().positive();
