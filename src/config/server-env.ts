import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^mysql:\/\//, "DATABASE_URL debe empezar con mysql://"),
  // Carpeta persistente para archivos subidos (fuera del deploy, que se
  // reemplaza en cada versión). Por defecto, una carpeta hermana del proyecto.
  BRISABEL_UPLOADS_DIR: z.string().min(1).optional(),
  // Notificaciones push (VAPID). Opcionales: sin ellas no se ofrecen avisos.
  VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_SUBJECT: z.string().regex(/^(https:|mailto:)/, "VAPID_SUBJECT debe empezar con https: o mailto:").optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

// Se valida en el primer uso y no al importar, para que `next build`
// no exija credenciales de base de datos.
export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    BRISABEL_UPLOADS_DIR: process.env.BRISABEL_UPLOADS_DIR || undefined,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || undefined,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || undefined,
    VAPID_SUBJECT: process.env.VAPID_SUBJECT || undefined,
  });

  return cached;
}
