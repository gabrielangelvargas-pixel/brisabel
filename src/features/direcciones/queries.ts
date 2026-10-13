import "server-only";

import { getDb } from "@/lib/db";

// Direcciones guardadas de un usuario: la usada más recientemente primero.
export async function getDireccionesDeUsuario(usuarioId: string) {
  return getDb().direccion.findMany({
    where: { usuarioId },
    orderBy: { modificado: "desc" },
    take: 10,
    select: { id: true, calle: true, barrio: true, ciudad: true, provincia: true, telefonoTipo: true, telefono: true },
  });
}

export type DireccionGuardada = Awaited<ReturnType<typeof getDireccionesDeUsuario>>[number];
