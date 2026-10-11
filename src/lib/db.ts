import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { getServerEnv } from "@/config/server-env";
import { adapterOptions, toPoolConfig } from "@/lib/db-config";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaMariaDb(toPoolConfig(getServerEnv().DATABASE_URL), adapterOptions);

  return new PrismaClient({ adapter });
}

// Una sola instancia por proceso (en desarrollo sobrevive al hot reload).
export function getDb() {
  globalForPrisma.prisma ??= createPrismaClient();

  return globalForPrisma.prisma;
}
