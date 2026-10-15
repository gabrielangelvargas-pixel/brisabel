"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { PORTADA_ALTO, PORTADA_ANCHO } from "@/features/portada/imagen-size";
import { PORTADA_TAG } from "@/features/portada/public-queries";
import {
  portadaFormValues,
  portadaIdSchema,
  portadaSchema,
  type PortadaFormValues,
  type PortadaInput,
} from "@/features/portada/schemas";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getArchivo, nombreArchivo, procesarImagen } from "@/lib/images";
import { deleteFile, saveFile } from "@/lib/storage";

export type PortadaFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof PortadaFormValues | "imagen", string>>;
  // Lo enviado, para no perderlo si hay errores (React reinicia el form).
  values?: PortadaFormValues;
};

const listaUrl = "/admin/portada";

function parse(formData: FormData) {
  const values = portadaFormValues(formData);
  const parsed = portadaSchema.safeParse(values);

  if (parsed.success) {
    return { values, data: parsed.data };
  }

  const { fieldErrors } = z.flattenError(parsed.error);

  return {
    values,
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).map(([campo, mensajes]) => [campo, (mensajes as string[] | undefined)?.[0]]),
    ) as PortadaFormState["fieldErrors"],
  };
}

function procesarFoto(archivo: File) {
  return procesarImagen(archivo, { ancho: PORTADA_ANCHO, alto: PORTADA_ALTO });
}

function datos(data: PortadaInput) {
  return { ocasion: data.ocasion, frase: data.frase, enlace: data.enlace, orden: data.orden, activa: data.activa };
}

// ------------------------------------------------------------------ Crear

export async function crearPortadaAction(_prev: PortadaFormState, formData: FormData): Promise<PortadaFormState> {
  await requireAdmin();

  const { values, data, fieldErrors } = parse(formData);
  const archivo = getArchivo(formData, "imagen");

  if (!data || !archivo) {
    return { values, fieldErrors: { ...fieldErrors, ...(archivo ? {} : { imagen: "Elegí una foto." }) } };
  }

  // La imagen se procesa antes de tocar la base: si es inválida, no se guarda nada.
  const imagen = await procesarFoto(archivo);

  if (!imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  let archivoGuardado: string | null = null;

  try {
    await getDb().$transaction(async (tx) => {
      // La imagen es obligatoria: se crea con un nombre provisorio y se
      // renombra con el id ya asignado.
      const creada = await tx.portada.create({ data: { ...datos(data), imagen: "" }, select: { id: true } });
      archivoGuardado = nombreArchivo("portada", creada.id);
      await saveFile("portadas", archivoGuardado, imagen.data);
      await tx.portada.update({ where: { id: creada.id }, data: { imagen: archivoGuardado } });
    });
  } catch (error) {
    await deleteFile("portadas", archivoGuardado);
    throw error;
  }

  updateTag(PORTADA_TAG);
  redirect(`${listaUrl}?ok=creada`);
}

// ----------------------------------------------------------------- Editar

export async function editarPortadaAction(
  id: number,
  _prev: PortadaFormState,
  formData: FormData,
): Promise<PortadaFormState> {
  await requireAdmin();

  const { values, data, fieldErrors } = parse(formData);

  if (!data) {
    return { values, fieldErrors };
  }

  const actual = await getDb().portada.findUnique({ where: { id }, select: { imagen: true } });

  if (!actual) {
    return { values, error: "Esta foto ya no existe." };
  }

  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarFoto(archivo) : null;

  if (imagen && !imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  const archivoNuevo = imagen?.ok ? nombreArchivo("portada", id) : null;

  try {
    if (archivoNuevo && imagen?.ok) {
      await saveFile("portadas", archivoNuevo, imagen.data);
    }

    await getDb().portada.update({
      where: { id },
      data: { ...datos(data), ...(archivoNuevo ? { imagen: archivoNuevo } : {}) },
    });
  } catch (error) {
    await deleteFile("portadas", archivoNuevo);
    throw error;
  }

  // Recién con los cambios guardados se borra la foto reemplazada.
  if (archivoNuevo) {
    await deleteFile("portadas", actual.imagen);
  }

  updateTag(PORTADA_TAG);
  redirect(`${listaUrl}?ok=actualizada`);
}

// --------------------------------------------------------------- Eliminar

export async function eliminarPortadaAction(formData: FormData) {
  await requireAdmin();

  const id = portadaIdSchema.parse(formData.get("id"));
  const portada = await getDb().portada.findUnique({ where: { id }, select: { imagen: true } });

  if (portada) {
    await getDb().portada.delete({ where: { id } });
    await deleteFile("portadas", portada.imagen);
  }

  updateTag(PORTADA_TAG);
  redirect(`${listaUrl}?ok=eliminada`);
}
