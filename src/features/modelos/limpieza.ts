import "server-only";

import type { Prisma } from "@/generated/prisma/client";

// Fuera del archivo "use server" a propósito: no debe quedar expuesta como
// acción invocable desde el navegador.

type Db = Pick<Prisma.TransactionClient, "producto" | "modelo">;

// Disuelve los modelos que quedaron con menos de 2 productos: el que queda
// vuelve a mostrarse solo.
export async function limpiarModelos(db: Db, modeloIds: (number | null | undefined)[]) {
  for (const id of new Set(modeloIds.filter((m): m is number => typeof m === "number"))) {
    const restantes = await db.producto.count({ where: { modeloId: id } });

    if (restantes < 2) {
      await db.producto.updateMany({
        where: { modeloId: id },
        data: { modeloId: null, variante: null, ordenVariante: 0 },
      });
      await db.modelo.deleteMany({ where: { id } });
    }
  }
}
