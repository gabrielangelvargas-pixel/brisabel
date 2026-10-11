import type { PrismaMariadbOptions } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";

// Sin "server-only": lo usa también el script de creación de admins.

// Convierte DATABASE_URL (mysql://usuario:clave@host:puerto/base?connection_limit=5)
// a la configuración del driver MariaDB. El driver no entiende el parámetro
// connection_limit de Prisma, por eso se traduce acá.
export function toPoolConfig(databaseUrl: string): PoolConfig {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: Number(url.searchParams.get("connection_limit") ?? 5),
    connectTimeout: 5000,
    acquireTimeout: 8000,
  };
}

// Protocolo de texto: con el binario, MariaDB 11 recibe los parámetros como
// utf8mb4_bin y falla todo LIKE contra columnas utf8mb4_unicode_ci
// ("Illegal mix of collations"). El driver sigue escapando los parámetros.
export const adapterOptions: PrismaMariadbOptions = { useTextProtocol: true };
