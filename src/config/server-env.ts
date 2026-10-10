import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^mysql:\/\//, "DATABASE_URL debe empezar con mysql://"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

// Se valida en el primer uso y no al importar, para que `next build`
// no exija credenciales de base de datos.
export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  return cached;
}
