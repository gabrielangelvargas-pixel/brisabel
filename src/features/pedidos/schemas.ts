import { z } from "zod";

export const MAX_ITEMS_PEDIDO = 50;

const textoOpcional = (max: number, mensaje: string) =>
  z
    .string()
    .trim()
    .max(max, mensaje)
    .transform((valor) => valor || null);

// Datos de "Finalizar compra". Los ítems llegan del carrito (solo id y
// cantidad): nombres y precios se toman de la base, nunca del navegador.
export const pedidoSchema = z
  .object({
    nombre: z.string().trim().min(3, "Ingresá tu nombre y apellido.").max(120, "Máximo 120 caracteres."),
    telefono: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{6,30}$/, "Ingresá un teléfono válido (solo números, espacios o guiones)."),
    entrega: z.enum(["RETIRO", "ENVIO"], { message: "Elegí cómo querés recibir tu pedido." }),
    direccion: textoOpcional(200, "Máximo 200 caracteres."),
    localidad: textoOpcional(100, "Máximo 100 caracteres."),
    notas: textoOpcional(500, "Máximo 500 caracteres."),
    items: z
      .array(z.object({ id: z.number().int().positive(), cantidad: z.number().int().min(1).max(99) }))
      .min(1, "Tu carrito está vacío.")
      .max(MAX_ITEMS_PEDIDO, "Demasiados productos en un solo pedido."),
  })
  .superRefine((datos, ctx) => {
    if (datos.entrega !== "ENVIO") return;
    if (!datos.direccion) ctx.addIssue({ code: "custom", path: ["direccion"], message: "Ingresá la dirección de entrega." });
    if (!datos.localidad) ctx.addIssue({ code: "custom", path: ["localidad"], message: "Ingresá la localidad." });
  });

export type PedidoCampo = "nombre" | "telefono" | "entrega" | "direccion" | "localidad" | "notas";
export type PedidoFormValues = Partial<Record<PedidoCampo, string>>;

export function leerPedidoForm(formData: FormData) {
  const texto = (campo: string) => String(formData.get(campo) ?? "");
  let items: unknown = [];

  try {
    items = JSON.parse(texto("items"));
  } catch {
    // Se informa como carrito vacío/ inválido en la validación.
  }

  const values: PedidoFormValues = {
    nombre: texto("nombre"),
    telefono: texto("telefono"),
    entrega: texto("entrega"),
    direccion: texto("direccion"),
    localidad: texto("localidad"),
    notas: texto("notas"),
  };

  return { values, input: { ...values, items } };
}
