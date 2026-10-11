// Formatos para mostrar en pantalla (es-AR).

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// "12500" -> "$ 12.500"; "999.5" -> "$ 999,5"
export function formatPrecio(valor: number | string) {
  return pesos.format(Number(valor));
}
