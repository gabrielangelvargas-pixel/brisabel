import { ESTADOS_PEDIDO } from "@/features/pedidos/estados";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const { label, className } = ESTADOS_PEDIDO[estado];

  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>{label}</span>;
}
