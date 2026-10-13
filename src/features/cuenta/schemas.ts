import { z } from "zod";

import { usernameSchema } from "@/features/auth/schemas";

// Datos editables desde "Mi cuenta". El DNI no se modifica (identifica la cuenta).
export const perfilSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre.").max(120, "Máximo 120 caracteres."),
  username: usernameSchema,
});

export type PerfilValues = Partial<Record<keyof z.input<typeof perfilSchema>, string>>;
