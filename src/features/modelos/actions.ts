"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { limpiarModelos } from "@/features/modelos/limpieza";
import { leerModeloForm, modeloIdSchema, type ModeloFormValues, type ModeloInput } from "@/features/modelos/schemas";
import { PRODUCTOS_TAG } from "@/features/productos/public-queries";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export type ModeloFormState = {
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
  values?: ModeloFormValues;
};

type Tx = Prisma.TransactionClient;

const listaUrl = "/admin/productos";

function erroresDe(parsed: ReturnType<typeof leerModeloForm>["parsed"]) {
  if (parsed.success) return {};

  const errores: Record<string, string> = {};

  for (const issue of parsed.error.issues) {
    const campo = String(issue.path[0] ?? "general");
    errores[campo] ??= issue.message;
  }

  return errores;
}

// Todos los productos del modelo tienen que estar en la misma categoría
// (la tarjeta agrupada se muestra en la página de esa categoría).
async function validarProductos(data: ModeloInput, modeloId?: number) {
  const ids = data.variantes.map((v) => v.productoId);
  const productos = await getDb().producto.findMany({
    where: { id: { in: ids } },
    select: { id: true, categoriaId: true, modeloId: true },
  });

  if (productos.length !== ids.length) {
    return "Alguno de los productos ya no existe. Volvé al listado y elegilos de nuevo.";
  }

  const quedan = productos.filter((p) => !data.variantes.find((v) => v.productoId === p.id)?.quitar);

  if (new Set(quedan.map((p) => p.categoriaId)).size > 1) {
    return "Los productos de un modelo tienen que ser de la misma categoría.";
  }

  if (modeloId && productos.some((p) => p.modeloId !== modeloId)) {
    return "La lista de productos del modelo cambió. Recargá la página.";
  }

  return null;
}

async function guardarVariantes(tx: Tx, modeloId: number, data: ModeloInput) {
  for (const v of data.variantes) {
    await tx.producto.update({
      where: { id: v.productoId },
      data: v.quitar
        ? { modeloId: null, variante: null, ordenVariante: 0 }
        : { modeloId, variante: v.variante, ordenVariante: v.orden },
    });
  }
}

// ---------------------------------------------------------------- Agrupar

export async function agruparAction(_prev: ModeloFormState, formData: FormData): Promise<ModeloFormState> {
  await requireAdmin();

  const { values, parsed } = leerModeloForm(formData);

  if (!parsed.success) {
    return { values, fieldErrors: erroresDe(parsed) };
  }

  const data = parsed.data;
  const error = await validarProductos(data);

  if (error) {
    return { values, error };
  }

  await getDb().$transaction(async (tx) => {
    // Modelos anteriores de estos productos (si los movemos a uno nuevo).
    const anteriores = await tx.producto.findMany({
      where: { id: { in: data.variantes.map((v) => v.productoId) }, modeloId: { not: null } },
      select: { modeloId: true },
    });
    const modelo = await tx.modelo.create({
      data: { nombre: data.nombre, variacion: data.variacion },
      select: { id: true },
    });

    await guardarVariantes(tx, modelo.id, data);
    await limpiarModelos(
      tx,
      anteriores.map((p) => p.modeloId),
    );
  });

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=agrupado`);
}

// ----------------------------------------------------------------- Editar

export async function editarModeloAction(
  modeloId: number,
  _prev: ModeloFormState,
  formData: FormData,
): Promise<ModeloFormState> {
  await requireAdmin();

  const { values, parsed } = leerModeloForm(formData);

  if (!parsed.success) {
    return { values, fieldErrors: erroresDe(parsed) };
  }

  const data = parsed.data;
  const error = await validarProductos(data, modeloId);

  if (error) {
    return { values, error };
  }

  await getDb().$transaction(async (tx) => {
    await tx.modelo.update({
      where: { id: modeloId },
      data: { nombre: data.nombre, variacion: data.variacion },
    });
    await guardarVariantes(tx, modeloId, data);
  });

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=modelo`);
}

// ------------------------------------------------------------- Desagrupar

export async function desagruparAction(formData: FormData) {
  await requireAdmin();

  const id = modeloIdSchema.parse(formData.get("id"));

  await getDb().$transaction(async (tx) => {
    await tx.producto.updateMany({
      where: { modeloId: id },
      data: { modeloId: null, variante: null, ordenVariante: 0 },
    });
    await tx.modelo.deleteMany({ where: { id } });
  });

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=desagrupado`);
}
