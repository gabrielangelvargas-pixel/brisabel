import { z } from "zod";

// Nombre de usuario: debe tener al menos una letra, así nunca se confunde
// con un DNI (solo dígitos) en el campo único de login.
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,40}$/, "Usar de 3 a 40 letras, números, punto, guion o guion bajo.")
  .regex(/[a-z]/, "Debe incluir al menos una letra.");

export const dniSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().regex(/^\d{7,9}$/, "DNI inválido."));

export const passwordSchema = z.string().min(8, "Mínimo 8 caracteres.").max(200);

export const loginSchema = z.object({
  identificador: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresá tu nombre.").max(120),
    username: usernameSchema,
    // DNI opcional: vacío se toma como no informado.
    dni: z
      .string()
      .trim()
      .transform((value) => value || undefined)
      .pipe(dniSchema.optional()),
    password: passwordSchema,
    confirmacion: z.string(),
  })
  .refine((data) => data.password === data.confirmacion, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmacion"],
  });

// Un identificador solo con dígitos (y puntos opcionales) es un DNI.
export function parseIdentifier(identificador: string) {
  const dni = dniSchema.safeParse(identificador);

  if (/^[\d.]+$/.test(identificador) && dni.success) {
    return { dni: dni.data } as const;
  }

  return { username: identificador.toLowerCase() } as const;
}
