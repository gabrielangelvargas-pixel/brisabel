"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { PORTADA_ALTO, PORTADA_ANCHO, PORTADA_MOVIL_ALTO, PORTADA_MOVIL_ANCHO } from "@/features/portada/imagen-size";
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
  fieldErrors?: Partial<Record<keyof PortadaFormValues | "imagen" | "imagenMovil", string>>;
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

// Foto vertical opcional (celulares). null si no se eligió archivo.
async function procesarFotoMovil(formData: FormData) {
  const archivo = getArchivo(formData, "imagenMovil");
  return archivo ? procesarImagen(archivo, { ancho: PORTADA_MOVIL_ANCHO, alto: PORTADA_MOVIL_ALTO }) : null;
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
  const movil = await procesarFotoMovil(formData);

  if (!imagen.ok || (movil && !movil.ok)) {
    return {
      values,
      fieldErrors: {
        ...(!imagen.ok ? { imagen: imagen.error } : {}),
        ...(movil && !movil.ok ? { imagenMovil: movil.error } : {}),
      },
    };
  }

  let archivoGuardado: string | null = null;
  let movilGuardado: string | null = null;

  try {
    await getDb().$transaction(async (tx) => {
      // La imagen es obligatoria: se crea con un nombre provisorio y se
      // renombra con el id ya asignado.
      const creada = await tx.portada.create({ data: { ...datos(data), imagen: "" }, select: { id: true } });
      archivoGuardado = nombreArchivo("portada", creada.id);
      await saveFile("portadas", archivoGuardado, imagen.data);
      if (movil?.ok) {
        movilGuardado = nombreArchivo("portada-movil", creada.id);
        await saveFile("portadas", movilGuardado, movil.data);
      }
      await tx.portada.update({ where: { id: creada.id }, data: { imagen: archivoGuardado, imagenMovil: movilGuardado } });
    });
  } catch (error) {
    await deleteFile("portadas", archivoGuardado);
    await deleteFile("portadas", movilGuardado);
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

  const actual = await getDb().portada.findUnique({ where: { id }, select: { imagen: true, imagenMovil: true } });

  if (!actual) {
    return { values, error: "Esta foto ya no existe." };
  }

  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarFoto(archivo) : null;
  const movil = await procesarFotoMovil(formData);

  if ((imagen && !imagen.ok) || (movil && !movil.ok)) {
    return {
      values,
      fieldErrors: {
        ...(imagen && !imagen.ok ? { imagen: imagen.error } : {}),
        ...(movil && !movil.ok ? { imagenMovil: movil.error } : {}),
      },
    };
  }

  const archivoNuevo = imagen?.ok ? nombreArchivo("portada", id) : null;
  // Vertical: nueva > quitar > dejar la actual.
  const movilNuevo = movil?.ok ? nombreArchivo("portada-movil", id) : null;
  const cambiaMovil = Boolean(movilNuevo) || (!movil && formData.get("quitarImagenMovil") === "on");

  try {
    if (archivoNuevo && imagen?.ok) {
      await saveFile("portadas", archivoNuevo, imagen.data);
    }
    if (movilNuevo && movil?.ok) {
      await saveFile("portadas", movilNuevo, movil.data);
    }

    await getDb().portada.update({
      where: { id },
      data: {
        ...datos(data),
        ...(archivoNuevo ? { imagen: archivoNuevo } : {}),
        ...(cambiaMovil ? { imagenMovil: movilNuevo } : {}),
      },
    });
  } catch (error) {
    await deleteFile("portadas", archivoNuevo);
    await deleteFile("portadas", movilNuevo);
    throw error;
  }

  // Recién con los cambios guardados se borran las fotos reemplazadas.
  if (archivoNuevo) {
    await deleteFile("portadas", actual.imagen);
  }
  if (cambiaMovil) {
    await deleteFile("portadas", actual.imagenMovil);
  }

  updateTag(PORTADA_TAG);
  redirect(`${listaUrl}?ok=actualizada`);
}

// --------------------------------------------------------------- Eliminar

export async function eliminarPortadaAction(formData: FormData) {
  await requireAdmin();

  const id = portadaIdSchema.parse(formData.get("id"));
  const portada = await getDb().portada.findUnique({ where: { id }, select: { imagen: true, imagenMovil: true } });

  if (portada) {
    await getDb().portada.delete({ where: { id } });
    await deleteFile("portadas", portada.imagen);
    await deleteFile("portadas", portada.imagenMovil);
  }

  updateTag(PORTADA_TAG);
  redirect(`${listaUrl}?ok=eliminada`);
}
