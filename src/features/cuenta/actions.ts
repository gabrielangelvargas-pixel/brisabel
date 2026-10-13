"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { perfilSchema, type PerfilValues } from "@/features/cuenta/schemas";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export type PerfilState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof PerfilValues, string>>;
  values?: PerfilValues;
};

export async function actualizarPerfilAction(_prev: PerfilState, formData: FormData): Promise<PerfilState> {
  const usuario = await requireUser();
  const values: PerfilValues = {
    nombre: String(formData.get("nombre") ?? ""),
    username: String(formData.get("username") ?? ""),
  };
  const parsed = perfilSchema.safeParse(values);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);

    return {
      values,
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([campo, mensajes]) => [campo, mensajes?.[0]])),
    };
  }

  try {
    await getDb().usuario.update({ where: { id: usuario.id }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { values, fieldErrors: { username: "Ese nombre de usuario ya está en uso." } };
    }

    console.error("Perfil: no se pudo guardar", error);
    return { values, error: "No pudimos guardar los cambios. Probá de nuevo en unos minutos." };
  }

  refresh();
  return { ok: true };
}
