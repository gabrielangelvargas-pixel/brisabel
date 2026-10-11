import { agruparParaTienda } from "@/features/productos/agrupar-tienda";
import { ModeloCard } from "@/features/productos/components/modelo-card";
import { ProductoCard } from "@/features/productos/components/producto-card";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import type { ProductoPublico } from "@/features/productos/public-queries";
import { formatPrecio } from "@/lib/format";

// Grilla de productos de la tienda: los productos de un mismo modelo se
// muestran en una sola tarjeta con sus variantes. Todavía sin enlace: la
// página de detalle de producto se agrega en un paso siguiente.
export function ProductoGrid({ productos }: { productos: ProductoPublico[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {agruparParaTienda(productos).map((tarjeta) =>
        tarjeta.tipo === "modelo" ? (
          <li key={`m${tarjeta.id}`}>
            <ModeloCard modelo={tarjeta} />
          </li>
        ) : (
          <li key={`p${tarjeta.producto.id}`}>
            <ProductoCard
              destacado={tarjeta.producto.destacado}
              imagenUrl={productoImagenUrl(tarjeta.producto.imagen)}
              nombre={tarjeta.producto.nombre}
              precio={formatPrecio(tarjeta.producto.precioVenta)}
            />
          </li>
        ),
      )}
    </ul>
  );
}
