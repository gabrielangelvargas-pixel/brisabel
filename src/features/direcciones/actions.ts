"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { direccionSchema, leerDireccionForm, type DireccionFormValues } from "@/features/direcciones/schemas";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// Direcciones del usuario desde "Mi cuenta". Una dirección que ya se usó en un
// pedido no se modifica ni se borra (el pedido la referencia): se archiva y,
// al editarla, se crea una nueva con los datos cambiados.

export type DireccionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof DireccionFormValues, string>>;
  values?: DireccionFormValues;
};

const idSchema = z.coerce.number().int().positive();

export async function guardarDireccionAction(_prev: DireccionState, formData: FormData): Promise<DireccionState> {
  const usuario = await requireUser();
  const { values, input } = leerDireccionForm(formData);
  const parsed = direccionSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    const { telefono, ...resto } = fieldErrors;

    return {
      values,
      fieldErrors: Object.fromEntries(
        Object.entries({ ...resto, direccionTelefono: telefono }).map(([campo, mensajes]) => [campo, mensajes?.[0]]),
      ),
    };
  }

  const db = getDb();
  const id = formData.get("id") ? idSchema.safeParse(formData.get("id")).data : undefined;

  try {
    if (id === undefined) {
      await db.direccion.create({ data: { usuarioId: usuario.id, ...parsed.data } });
    } else {
      const actual = await db.direccion.findFirst({
        where: { id, usuarioId: usuario.id, archivada: false },
        select: { _count: { select: { pedidos: true } } },
      });

      if (!actual) {
        return { values, error: "No encontramos esa dirección. Recargá la página." };
      }

      if (actual._count.pedidos > 0) {
        await db.$transaction([
          db.direccion.update({ where: { id }, data: { archivada: true } }),
          db.direccion.create({ data: { usuarioId: usuario.id, ...parsed.data } }),
        ]);
      } else {
        await db.direccion.update({ where: { id }, data: parsed.data });
      }
    }
  } catch (error) {
    console.error("Dirección: no se pudo guardar", error);
    return { values, error: "No pudimos guardar la dirección. Probá de nuevo en unos minutos." };
  }

  refresh();
  return { ok: true };
}

export async function eliminarDireccionAction(formData: FormData) {
  const usuario = await requireUser();
  const id = idSchema.safeParse(formData.get("id")).data;

  if (id === undefined) return;

  const direccion = await getDb().direccion.findFirst({
    where: { id, usuarioId: usuario.id, archivada: false },
    select: { _count: { select: { pedidos: true } } },
  });

  if (!direccion) return;

  if (direccion._count.pedidos > 0) {
    await getDb().direccion.update({ where: { id }, data: { archivada: true } });
  } else {
    await getDb().direccion.delete({ where: { id } });
  }

  refresh();
}
