import { agruparParaTienda } from "@/features/productos/agrupar-tienda";
import { ProductoTarjeta } from "@/features/productos/components/producto-tarjeta";
import type { ProductoPublico } from "@/features/productos/public-queries";

// Grilla de productos de la tienda: los productos de un mismo modelo se
// muestran en una sola tarjeta con sus variantes; tocar la foto abre el detalle.
export function ProductoGrid({ productos, categoria }: { productos: ProductoPublico[]; categoria: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {agruparParaTienda(productos).map((tarjeta) =>
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
  );
}
