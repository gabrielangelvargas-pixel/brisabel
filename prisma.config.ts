import nextEnv from "@next/env";
import { defineConfig } from "prisma/config";

// Carga .env con las mismas reglas que Next (.env, .env.local, etc.).
nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Opcional para `prisma generate` (CI); requerido para migrar.
    url: process.env.DATABASE_URL,
  },
});
