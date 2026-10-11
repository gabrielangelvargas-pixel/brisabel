import type { ProductoPublico } from "@/features/productos/public-queries";

// Arma las tarjetas de la tienda: los productos de un mismo modelo se juntan
// en una tarjeta; el resto va solo. Se respeta el orden recibido (destacados
// primero): cada modelo ocupa el lugar de su primer producto.

export type TarjetaTienda =
  | { tipo: "producto"; producto: ProductoPublico }
  | {
      tipo: "modelo";
      id: number;
      nombre: string;
      variacion: string;
      destacado: boolean;
      variantes: ProductoPublico[];
    };

export function agruparParaTienda(productos: ProductoPublico[]): TarjetaTienda[] {
  const tarjetas: TarjetaTienda[] = [];
  const modelos = new Map<number, Extract<TarjetaTienda, { tipo: "modelo" }>>();

  for (const producto of productos) {
    if (!producto.modelo) {
      tarjetas.push({ tipo: "producto", producto });
      continue;
    }

    let grupo = modelos.get(producto.modelo.id);

    if (!grupo) {
      grupo = {
        tipo: "modelo",
        id: producto.modelo.id,
        nombre: producto.modelo.nombre,
        variacion: producto.modelo.variacion,
        destacado: false,
        variantes: [],
      };
      modelos.set(producto.modelo.id, grupo);
      tarjetas.push(grupo);
    }

    grupo.variantes.push(producto);
    grupo.destacado ||= producto.destacado;
  }

  for (const grupo of modelos.values()) {
    grupo.variantes.sort((a, b) => a.ordenVariante - b.ordenVariante || (a.variante ?? "").localeCompare(b.variante ?? "", "es"));
  }

  // Un modelo con una sola variante visible (las otras ocultas) se muestra
  // como producto suelto.
  return tarjetas.map((t) => (t.tipo === "modelo" && t.variantes.length === 1 ? { tipo: "producto", producto: t.variantes[0] } : t));
}

// Precio a mostrar antes de elegir variante: el mínimo, y si es "desde".
export function precioDelModelo(variantes: ProductoPublico[]) {
  const precios = variantes.map((v) => Number(v.precioVenta));
  const minimo = Math.min(...precios);

  return { minimo, desde: precios.some((p) => p !== minimo) };
}
