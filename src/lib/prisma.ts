import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }

  const adapter = new PrismaMariaDb(databaseUrl.replace(/^mysql:/, "mariadb:"));
  const prisma = new PrismaClient({ adapter });

  globalForPrisma.prisma = prisma;

  return prisma;
}
