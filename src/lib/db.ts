import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { getServerEnv } from "@/config/server-env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  // El driver de MariaDB espera el esquema mariadb:// (MySQL es compatible).
  const url = getServerEnv().DATABASE_URL.replace(/^mysql:/, "mariadb:");

  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}

// Una sola instancia por proceso (en desarrollo sobrevive al hot reload).
export function getDb() {
  globalForPrisma.prisma ??= createPrismaClient();

  return globalForPrisma.prisma;
}
