import "server-only";

import { getDb } from "@/lib/db";

export async function getPerfil(usuarioId: string) {
  return getDb().usuario.findUnique({
    where: { id: usuarioId },
    select: { nombre: true, username: true, dni: true },
  });
}
