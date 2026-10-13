import { z } from "zod";

import { direccionSchema, telefonoSchema, type DireccionCampo } from "@/features/direcciones/schemas";

export const MAX_ITEMS_PEDIDO = 50;

// Datos de "Finalizar compra". Los ítems llegan del carrito (solo id y
// cantidad): nombres y precios se toman de la base, nunca del navegador.
// - Retiro: se pide un teléfono de contacto.
// - Envío: una dirección guardada (direccionId = su id) o una nueva
//   (direccionId = "nueva" + los campos de la dirección).
export const pedidoSchema = z
  .object({
    nombre: z.string().trim().min(3, "Ingresá tu nombre y apellido.").max(120, "Máximo 120 caracteres."),
    entrega: z.enum(["RETIRO", "ENVIO"], { message: "Elegí cómo querés recibir tu pedido." }),
    telefono: z.string(),
    direccionId: z.string(),
    calle: z.string(),
    barrio: z.string(),
    ciudad: z.string(),
    provincia: z.string(),
    telefonoTipo: z.string(),
    direccionTelefono: z.string(),
    notas: z
      .string()
      .trim()
      .max(500, "Máximo 500 caracteres.")
      .transform((valor) => valor || null),
    items: z
      .array(z.object({ id: z.number().int().positive(), cantidad: z.number().int().min(1).max(99) }))
      .min(1, "Tu carrito está vacío.")
      .max(MAX_ITEMS_PEDIDO, "Demasiados productos en un solo pedido."),
  })
  .superRefine((datos, ctx) => {
    const sumarErrores = (resultado: z.ZodSafeParseResult<unknown>, renombrar: Record<string, string> = {}) => {
      for (const issue of resultado.error?.issues ?? []) {
        const campo = String(issue.path[0] ?? "");
        ctx.addIssue({ code: "custom", path: [renombrar[campo] ?? campo], message: issue.message });
      }
    };

    if (datos.entrega === "RETIRO") {
      sumarErrores(z.object({ telefono: telefonoSchema }).safeParse({ telefono: datos.telefono }));
    } else if (datos.direccionId === "nueva") {
      sumarErrores(direccionSchema.safeParse(direccionNueva(datos)), { telefono: "direccionTelefono" });
    } else if (!(Number(datos.direccionId) > 0)) {
      ctx.addIssue({ code: "custom", path: ["direccionId"], message: "Elegí una dirección de entrega." });
    }
  });

export type PedidoDatos = z.infer<typeof pedidoSchema>;

// Campos de la dirección nueva, listos para direccionSchema.
export function direccionNueva(datos: Omit<PedidoDatos, "notas" | "items"> | Record<string, string>) {
  return {
    calle: datos.calle,
    barrio: datos.barrio,
    ciudad: datos.ciudad,
    provincia: datos.provincia,
    telefonoTipo: datos.telefonoTipo,
    telefono: datos.direccionTelefono,
  };
}

export type PedidoCampo =
  | "nombre"
  | "entrega"
  | "telefono"
  | "notas"
  | "direccionId"
  | "direccionTelefono"
  | Exclude<DireccionCampo, "telefono">;
export type PedidoFormValues = Partial<Record<PedidoCampo, string>>;

const CAMPOS: PedidoCampo[] = [
  "nombre",
  "entrega",
  "telefono",
  "notas",
  "direccionId",
  "calle",
  "barrio",
  "ciudad",
  "provincia",
  "telefonoTipo",
  "direccionTelefono",
];

export function leerPedidoForm(formData: FormData) {
  const values = Object.fromEntries(CAMPOS.map((campo) => [campo, String(formData.get(campo) ?? "")])) as Record<
    PedidoCampo,
    string
  >;
  let items: unknown = [];

  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    // Se informa como carrito inválido en la validación.
  }

  return { values, input: { ...values, items } };
}
