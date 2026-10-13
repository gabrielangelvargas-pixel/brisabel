import { ChevronRight, Expand } from "lucide-react";
import type { ReactNode } from "react";

import { agruparParaTienda } from "@/features/productos/agrupar-tienda";
import { ProductoTarjeta } from "@/features/productos/components/producto-tarjeta";
import type { ProductoPublico } from "@/features/productos/public-queries";

// Grilla de productos de la tienda: los productos de un mismo modelo se
// muestran en una sola tarjeta con sus variantes; tocar la foto abre el detalle.
export function ProductoGrid({ productos, categoria }: { productos: ProductoPublico[]; categoria: string }) {
  const tarjetas = agruparParaTienda(productos);
  const hayVariantes = tarjetas.some((tarjeta) => tarjeta.tipo === "modelo");

  return (
    <>
      {/* Ayuda breve: los mismos íconos que aparecen en las tarjetas. */}
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted sm:text-sm">
        <li className="inline-flex items-center gap-1.5">
          <Icono>
            <Expand className="size-3" />
          </Icono>
          Tocá la foto para ver el detalle
        </li>
        {hayVariantes ? (
          <li className="inline-flex items-center gap-1.5">
            <Icono>
              <ChevronRight className="size-3" />
            </Icono>
            Tocá la flecha para ver otros colores o medidas
          </li>
        ) : null}
      </ul>

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {tarjetas.map((tarjeta) =>
          tarjeta.tipo === "modelo" ? (
            <li key={`m${tarjeta.id}`}>
              <ProductoTarjeta
                categoria={categoria}
                nombre={tarjeta.nombre}
                variacion={tarjeta.variacion}
                variantes={tarjeta.variantes}
              />
            </li>
          ) : (
            <li key={`p${tarjeta.producto.id}`}>
              <ProductoTarjeta
                categoria={categoria}
                nombre={tarjeta.producto.nombre}
                variacion={null}
                variantes={[tarjeta.producto]}
              />
            </li>
          ),
        )}
      </ul>
    </>
  );
}

function Icono({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-brand"
    >
      {children}
    </span>
  );
}
