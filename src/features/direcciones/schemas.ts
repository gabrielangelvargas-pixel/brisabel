import { z } from "zod";

export const PROVINCIAS = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export const TELEFONO_TIPOS = { CELULAR: "Celular", FIJO: "Fijo" } as const;

export const telefonoSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s()-]{6,30}$/, "Ingresá un teléfono válido (solo números, espacios o guiones).");

// Dirección de entrega nueva (al finalizar una compra con envío).
export const direccionSchema = z.object({
  calle: z.string().trim().min(3, "Ingresá la calle y el número.").max(200, "Máximo 200 caracteres."),
  barrio: z.string().trim().min(2, "Ingresá el barrio.").max(100, "Máximo 100 caracteres."),
  ciudad: z.string().trim().min(2, "Ingresá la ciudad.").max(100, "Máximo 100 caracteres."),
  provincia: z.enum(PROVINCIAS, { message: "Elegí la provincia." }),
  telefonoTipo: z.enum(["CELULAR", "FIJO"], { message: "Elegí el tipo de teléfono." }),
  telefono: telefonoSchema,
});

export type DireccionCampo = keyof z.infer<typeof direccionSchema>;
