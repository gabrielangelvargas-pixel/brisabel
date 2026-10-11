"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { categoriaIdSchema, parseCategoriaForm, type CategoriaInput } from "@/features/categorias/schemas";
import { buildRuta, isInSubtree, MAX_NIVEL } from "@/features/categorias/tree";
import { getArchivo, nombreArchivoCategoria, procesarImagenCategoria } from "@/features/categorias/imagen";
import { getAlturaSubarbol } from "@/features/categorias/queries";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { deleteFile, saveFile } from "@/lib/storage";

type CategoriaField = "nombre" | "slug" | "descripcion" | "parentId" | "imagen";

export type CategoriaFormValues = {
  nombre: string;
  slug: string;
  descripcion: string;
  parentId: string;
  activa: boolean;
};

export type CategoriaFormState = {
  error?: string;
  fieldErrors?: Partial<Record<CategoriaField, string>>;
  // Lo enviado, para no perderlo si hay errores (React reinicia el form).
  values?: CategoriaFormValues;
};

function formValues(formData: FormData): CategoriaFormValues {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    parentId: String(formData.get("parentId") ?? ""),
    activa: formData.get("activa") === "on",
  };
}

type Tx = Prisma.TransactionClient;

const listaUrl = "/admin/categorias";

function fieldErrorsFrom(error: z.ZodError) {
  const { fieldErrors } = z.flattenError(error);

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, (messages as string[] | undefined)?.[0]]),
  ) as CategoriaFormState["fieldErrors"];
}

function isSlugDuplicado(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    JSON.stringify(error.meta ?? {}).includes("slug")
  );
}

async function siguienteOrden(tx: Tx, parentId: number | null) {
  const { _max } = await tx.categoria.aggregate({ where: { parentId }, _max: { orden: true } });

  return (_max.orden ?? -1) + 1;
}

// Valida el padre elegido y devuelve su ruta y nivel (null = raíz).
async function resolverPadre(parentId: number | null) {
  if (parentId === null) {
    return { padre: null };
  }

  const padre = await getDb().categoria.findUnique({
    where: { id: parentId },
    select: { id: true, ruta: true, nivel: true },
  });

  if (!padre) {
    return { error: "La categoría padre ya no existe." };
  }

  if (padre.nivel >= MAX_NIVEL) {
    return { error: `Se permiten hasta ${MAX_NIVEL + 1} niveles de categorías.` };
  }

  return { padre };
}

// ------------------------------------------------------------------ Crear

export async function crearCategoriaAction(
  _prev: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  await requireAdmin();

  const parsed = parseCategoriaForm(formData);

  const values = formValues(formData);

  if (!parsed.success) {
    return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const { padre, error } = await resolverPadre(data.parentId);

  if (error) {
    return { values, fieldErrors: { parentId: error } };
  }

  // La imagen se procesa antes de tocar la base: si es inválida, no se guarda nada.
  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarImagenCategoria(archivo) : null;

  if (imagen && !imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  let archivoGuardado: string | null = null;

  try {
    await getDb().$transaction(async (tx) => {
      const creada = await tx.categoria.create({
        data: {
          ...datosEditables(data),
          parentId: padre?.id ?? null,
          orden: await siguienteOrden(tx, padre?.id ?? null),
          nivel: padre ? padre.nivel + 1 : 0,
          ruta: "", // se completa abajo: necesita el id
        },
        select: { id: true },
      });

      if (imagen?.ok) {
        archivoGuardado = nombreArchivoCategoria(creada.id);
        await saveFile("categorias", archivoGuardado, imagen.data);
      }

      await tx.categoria.update({
        where: { id: creada.id },
        data: { ruta: buildRuta(padre?.ruta ?? null, creada.id), imagen: archivoGuardado },
      });
    });
  } catch (err) {
    await deleteFile("categorias", archivoGuardado);

    if (isSlugDuplicado(err)) {
      return { values, fieldErrors: { slug: "Ya existe una categoría con ese slug." } };
    }
    throw err;
  }

  redirect(`${listaUrl}?ok=creada`);
}

// ----------------------------------------------------------------- Editar

export async function editarCategoriaAction(
  id: number,
  _prev: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  await requireAdmin();

  const parsed = parseCategoriaForm(formData);

  const values = formValues(formData);

  if (!parsed.success) {
    return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const data = parsed.data;
  const actual = await getDb().categoria.findUnique({
    where: { id },
    select: { id: true, parentId: true, ruta: true, nivel: true, imagen: true },
  });

  if (!actual) {
    return { values, error: "La categoría ya no existe." };
  }

  const cambiaPadre = data.parentId !== actual.parentId;
  let nuevaUbicacion: { parentId: number | null; ruta: string; nivel: number } | null = null;

  if (cambiaPadre) {
    const { padre, error } = await resolverPadre(data.parentId);

    if (error) {
      return { values, fieldErrors: { parentId: error } };
    }

    // Evita ciclos: el nuevo padre no puede estar dentro de la propia categoría.
    if (padre && isInSubtree(padre.ruta, actual.ruta)) {
      return { values, fieldErrors: { parentId: "No se puede mover una categoría dentro de sí misma." } };
    }

    const nivel = padre ? padre.nivel + 1 : 0;

    if (nivel + (await getAlturaSubarbol(actual)) > MAX_NIVEL) {
      return {
        values,
        fieldErrors: {
          parentId: `Con sus subcategorías superaría los ${MAX_NIVEL + 1} niveles permitidos.`,
        },
      };
    }

    nuevaUbicacion = { parentId: padre?.id ?? null, ruta: buildRuta(padre?.ruta ?? null, id), nivel };
  }

  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarImagenCategoria(archivo) : null;

  if (imagen && !imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  // Imagen nueva > quitar imagen > dejar la actual.
  const quitarImagen = !imagen && formData.get("quitarImagen") === "on";
  const archivoNuevo = imagen?.ok ? nombreArchivoCategoria(id) : null;
  const cambiaImagen = Boolean(archivoNuevo) || quitarImagen;

  try {
    await getDb().$transaction(async (tx) => {
      if (archivoNuevo && imagen?.ok) {
        await saveFile("categorias", archivoNuevo, imagen.data);
      }

      await tx.categoria.update({
        where: { id },
        data: {
          ...datosEditables(data),
          ...(cambiaImagen ? { imagen: archivoNuevo } : {}),
          ...(nuevaUbicacion
            ? { ...nuevaUbicacion, orden: await siguienteOrden(tx, nuevaUbicacion.parentId) }
            : {}),
        },
      });

      if (nuevaUbicacion) {
        await moverDescendientes(tx, actual, nuevaUbicacion);
      }
    });
  } catch (err) {
    await deleteFile("categorias", archivoNuevo);

    if (isSlugDuplicado(err)) {
      return { values, fieldErrors: { slug: "Ya existe una categoría con ese slug." } };
    }
    throw err;
  }

  // Recién con los cambios guardados se borra la imagen reemplazada.
  if (cambiaImagen) {
    await deleteFile("categorias", actual.imagen);
  }

  redirect(`${listaUrl}?ok=actualizada`);
}

// Reescribe ruta y nivel del subárbol tras mover una categoría.
async function moverDescendientes(
  tx: Tx,
  anterior: { id: number; ruta: string; nivel: number },
  nueva: { ruta: string; nivel: number },
) {
  const descendientes = await tx.categoria.findMany({
    where: { ruta: { startsWith: anterior.ruta }, NOT: { id: anterior.id } },
    select: { id: true, ruta: true, nivel: true },
  });
  const deltaNivel = nueva.nivel - anterior.nivel;

  for (const descendiente of descendientes) {
    await tx.categoria.update({
      where: { id: descendiente.id },
      data: {
        ruta: nueva.ruta + descendiente.ruta.slice(anterior.ruta.length),
        nivel: descendiente.nivel + deltaNivel,
      },
    });
  }
}

function datosEditables(data: CategoriaInput) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion,
    activa: data.activa,
  };
}

// --------------------------------------------------------------- Eliminar

export async function eliminarCategoriaAction(formData: FormData) {
  await requireAdmin();

  const id = categoriaIdSchema.parse(formData.get("id"));
  const categoria = await getDb().categoria.findUnique({
    where: { id },
    select: { imagen: true, _count: { select: { hijas: true } } },
  });

  if (!categoria) {
    redirect(listaUrl);
  }

  if (categoria._count.hijas > 0) {
    redirect(`${listaUrl}?error=tiene-hijas`);
  }

  await getDb().categoria.delete({ where: { id } });
  await deleteFile("categorias", categoria.imagen);
  redirect(`${listaUrl}?ok=eliminada`);
}

// ------------------------------------------------------------- Reordenar

// Sube o baja una categoría entre sus hermanas y renumera el orden (0, 1, 2…).
export async function moverCategoriaAction(formData: FormData) {
  await requireAdmin();

  const id = categoriaIdSchema.parse(formData.get("id"));
  const direccion = z.enum(["arriba", "abajo"]).parse(formData.get("direccion"));

  await getDb().$transaction(async (tx) => {
    const categoria = await tx.categoria.findUnique({ where: { id }, select: { parentId: true } });

    if (!categoria) return;

    const hermanas = await tx.categoria.findMany({
      where: { parentId: categoria.parentId },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      select: { id: true },
    });
    const indice = hermanas.findIndex((hermana) => hermana.id === id);
    const destino = direccion === "arriba" ? indice - 1 : indice + 1;

    if (destino < 0 || destino >= hermanas.length) return;

    [hermanas[indice], hermanas[destino]] = [hermanas[destino], hermanas[indice]];

    for (const [orden, hermana] of hermanas.entries()) {
      await tx.categoria.update({ where: { id: hermana.id }, data: { orden } });
    }
  });

  redirect(listaUrl);
}
