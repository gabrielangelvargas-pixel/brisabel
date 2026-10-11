import { z } from "zod";

import { slugify } from "@/features/categorias/tree";

// Lee un precio escrito como en Argentina: "12.500" (punto de miles),
// "12.500,50" o "12500,50" (coma decimal). También acepta "12500.50".
export function normalizarPrecio(texto: string) {
  const value = texto.trim().replace(/[\s$]/g, "");

  if (value.includes(",")) {
    return value.replace(/\./g, "").replace(",", ".");
  }

  // Solo puntos agrupando de a 3 dígitos: son separadores de miles.
  if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    return value.replace(/\./g, "");
  }

  return value;
}

// Precio en pesos con hasta 2 decimales.
const precio = (mensaje: string) =>
  z
    .string()
    .transform(normalizarPrecio)
    .pipe(
      z
        .string()
        .regex(/^\d{1,10}(\.\d{1,2})?$/, mensaje)
        .transform(Number),
    );

export const productoSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9._-]{0,39}$/, "Usá letras, números, punto, guion o guion bajo (máx. 40)."),
    nombre: z.string().trim().min(2, "Ingresá un nombre.").max(150),
    // Opcional: si queda vacío se genera a partir del nombre.
    slug: z.string().trim().max(170),
    precioCosto: precio("Ingresá un precio válido (ej. 8500 o 8500,50)."),
    precioVenta: precio("Ingresá un precio válido (ej. 12500 o 12500,50)."),
    categoriaId: z.coerce.number({ error: "Elegí una categoría." }).int().positive("Elegí una categoría."),
    activo: z.boolean(),
    destacado: z.boolean(),
  })
  .transform((data) => ({ ...data, slug: slugify(data.slug || data.nombre).slice(0, 170) }))
  .refine((data) => data.slug.length >= 2, {
    message: "El nombre o el slug deben tener letras o números.",
    path: ["slug"],
  })
  .refine((data) => data.precioVenta > 0, {
    message: "El precio de venta tiene que ser mayor a cero.",
    path: ["precioVenta"],
  });

export type ProductoInput = z.output<typeof productoSchema>;

export type ProductoFormValues = {
  sku: string;
  nombre: string;
  slug: string;
  precioCosto: string;
  precioVenta: string;
  categoriaId: string;
  activo: boolean;
  destacado: boolean;
};

export function productoFormValues(formData: FormData): ProductoFormValues {
  return {
    sku: String(formData.get("sku") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    precioCosto: String(formData.get("precioCosto") ?? ""),
    precioVenta: String(formData.get("precioVenta") ?? ""),
    categoriaId: String(formData.get("categoriaId") ?? ""),
    activo: formData.get("activo") === "on",
    destacado: formData.get("destacado") === "on",
  };
}

export const productoIdSchema = z.coerce.number().int().positive();
