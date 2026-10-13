// Textos y colores de los estados del pedido (compartido por el panel y "Mis pedidos").
import type { EstadoPedido, TipoEntrega } from "@/generated/prisma/enums";

export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-orange/15 text-orange-strong" },
  CONFIRMADO: { label: "Confirmado", className: "bg-brand-soft text-brand" },
  ENTREGADO: { label: "Entregado", className: "bg-leaf/15 text-brand" },
  CANCELADO: { label: "Cancelado", className: "bg-accent-soft text-accent" },
};

export const ENTREGAS: Record<TipoEntrega, string> = {
  RETIRO: "Retiro en el local",
  ENVIO: "Envío a domicilio",
};

// "#000123"
export function numeroPedido(id: number) {
  return `#${String(id).padStart(6, "0")}`;
}
