import "server-only";

import { getDb } from "@/lib/db";

// Lecturas del panel.

export async function getPortadasAdmin() {
  return getDb().portada.findMany({ orderBy: [{ orden: "asc" }, { id: "asc" }] });
}

export async function getPortadaById(id: number) {
  return getDb().portada.findUnique({ where: { id } });
}
