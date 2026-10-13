// Página a la que volver después de ingresar o crear la cuenta (?volver=...).
// Solo rutas internas: "/finalizar-compra" sí; "https://otro.com" o "//otro.com"
// no (evita redirigir a sitios externos).
export function volverSeguro(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) {
    return null;
  }

  return valor;
}
