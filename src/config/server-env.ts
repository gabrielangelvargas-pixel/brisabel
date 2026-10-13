import "server-only";

import { z } from "zod";

// Quita comillas que a veces quedan al copiar valores desde un .env
// ("valor" o 'valor') en el panel del hosting.
const sinComillas = (valor: string | undefined) => valor?.trim().replace(/^(["'])(.*)\1$/, "$2") || undefined;

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^mysql:\/\//, "DATABASE_URL debe empezar con mysql://"),
  // Carpeta persistente para archivos subidos (fuera del deploy, que se
  // reemplaza en cada versión). Por defecto, una carpeta hermana del proyecto.
  BRISABEL_UPLOADS_DIR: z.string().min(1).optional(),
});

// Notificaciones push (VAPID). Opcionales y validadas aparte: si faltan o
// están mal cargadas, el sitio funciona igual, solo sin avisos.
const pushEnvSchema = z.object({
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z
    .string()
    .regex(/^(https:|mailto:)/)
    .catch("https://brisabel.com.ar"),
});

type ServerEnv = z.infer<typeof serverEnvSchema> & { push: z.infer<typeof pushEnvSchema> | null };

let cached: ServerEnv | undefined;

// Se valida en el primer uso y no al importar, para que `next build`
// no exija credenciales de base de datos.
export function getServerEnv(): ServerEnv {
  if (!cached) {
    const push = pushEnvSchema.safeParse({
      VAPID_PUBLIC_KEY: sinComillas(process.env.VAPID_PUBLIC_KEY),
      VAPID_PRIVATE_KEY: sinComillas(process.env.VAPID_PRIVATE_KEY),
      VAPID_SUBJECT: sinComillas(process.env.VAPID_SUBJECT),
    });

    if (!push.success && (process.env.VAPID_PUBLIC_KEY || process.env.VAPID_PRIVATE_KEY)) {
      console.error("Variables VAPID incompletas o inválidas: las notificaciones push quedan desactivadas.");
    }

    cached = {
      ...serverEnvSchema.parse({
        DATABASE_URL: sinComillas(process.env.DATABASE_URL),
        BRISABEL_UPLOADS_DIR: sinComillas(process.env.BRISABEL_UPLOADS_DIR),
      }),
      push: push.success ? push.data : null,
    };
  }

  return cached;
}
