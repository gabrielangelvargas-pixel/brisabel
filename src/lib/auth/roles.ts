// Códigos de la tabla Rol (los crea la migración "roles").
// Sin "server-only": lo usa también el script de creación de admins.
export const ROLES = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
} as const;

export type RolCodigo = (typeof ROLES)[keyof typeof ROLES];
