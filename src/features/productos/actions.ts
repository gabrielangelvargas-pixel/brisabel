"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { limpiarModelos } from "@/features/modelos/limpieza";
import { PRODUCTO_IMAGEN_LADO } from "@/features/productos/imagen-size";
import { PRODUCTOS_TAG } from "@/features/productos/public-queries";
import {
  productoFormValues,
  productoIdSchema,
  productoSchema,
  type ProductoFormValues,
  type ProductoInput,
} from "@/features/productos/schemas";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getArchivo, nombreArchivo, procesarImagen } from "@/lib/images";
import { deleteFile, saveFile } from "@/lib/storage";

type ProductoField = keyof ProductoFormValues | "imagen";

export type ProductoFormState = {
  error?: string;
  fieldErrors?: Partial<Record<ProductoField, string>>;
  // Lo enviado, para no perderlo si hay errores (React reinicia el form).
  values?: ProductoFormValues;
};

const listaUrl = "/admin/productos";

function parse(formData: FormData) {
  const values = productoFormValues(formData);
  const parsed = productoSchema.safeParse(values);

  if (parsed.success) {
    return { values, data: parsed.data };
  }

  const { fieldErrors } = z.flattenError(parsed.error);

  return {
    values,
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [field, (messages as string[] | undefined)?.[0]]),
    ) as ProductoFormState["fieldErrors"],
  };
}

// Los productos solo van en categorías sin subcategorías.
async function validarCategoria(categoriaId: number) {
  const categoria = await getDb().categoria.findUnique({
    where: { id: categoriaId },
    select: { _count: { select: { hijas: true } } },
  });

  if (!categoria) {
    return "La categoría elegida ya no existe.";
  }

  if (categoria._count.hijas > 0) {
    return "Elegí una categoría sin subcategorías (la más específica).";
  }

  return null;
}

// Traduce SKU o slug repetidos a un error del campo correspondiente.
function errorDeDuplicado(error: unknown): ProductoFormState["fieldErrors"] | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return null;
  }

  const detalle = JSON.stringify(error.meta ?? {});

  if (detalle.includes("sku")) return { sku: "Ya existe un producto con ese SKU." };
  if (detalle.includes("slug")) return { slug: "Ya existe un producto con ese slug." };

  return null;
}

// Slug generado del nombre: si ya existe, prueba "slug-2", "slug-3"...
// Un slug escrito a mano se respeta (si está repetido, se informa el error).
async function conSlugDisponible(data: ProductoInput, excluirId?: number): Promise<ProductoInput> {
  if (!data.slugAuto) {
    return data;
  }

  const ocupados = new Set(
    (
      await getDb().producto.findMany({
        where: {
          OR: [{ slug: data.slug }, { slug: { startsWith: `${data.slug}-` } }],
          ...(excluirId ? { NOT: { id: excluirId } } : {}),
        },
        select: { slug: true },
      })
    ).map((p) => p.slug),
  );

  let slug = data.slug;

  for (let n = 2; ocupados.has(slug); n++) {
    const sufijo = `-${n}`;
    slug = `${data.slug.slice(0, 170 - sufijo.length)}${sufijo}`;
  }

  return { ...data, slug };
}

function datos(data: ProductoInput) {
  return {
    sku: data.sku,
    nombre: data.nombre,
    slug: data.slug,
    precioCosto: data.precioCosto,
    precioVenta: data.precioVenta,
    categoriaId: data.categoriaId,
    activo: data.activo,
    destacado: data.destacado,
  };
}

function procesarImagenProducto(archivo: File) {
  return procesarImagen(archivo, { ancho: PRODUCTO_IMAGEN_LADO, alto: PRODUCTO_IMAGEN_LADO });
}

// ------------------------------------------------------------------ Crear

export async function crearProductoAction(
  _prev: ProductoFormState,
  formData: FormData,
): Promise<ProductoFormState> {
  await requireAdmin();

  const { values, data: leido, fieldErrors } = parse(formData);

  if (!leido) {
    return { values, fieldErrors };
  }

  const data = await conSlugDisponible(leido);
  const errorCategoria = await validarCategoria(data.categoriaId);

  if (errorCategoria) {
    return { values, fieldErrors: { categoriaId: errorCategoria } };
  }

  // La imagen se procesa antes de tocar la base: si es inválida, no se guarda nada.
  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarImagenProducto(archivo) : null;

  if (imagen && !imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  let archivoGuardado: string | null = null;

  try {
    await getDb().$transaction(async (tx) => {
      const creado = await tx.producto.create({ data: datos(data), select: { id: true } });

      if (imagen?.ok) {
        archivoGuardado = nombreArchivo("producto", creado.id);
        await saveFile("productos", archivoGuardado, imagen.data);
        await tx.producto.update({ where: { id: creado.id }, data: { imagen: archivoGuardado } });
      }
    });
  } catch (err) {
    await deleteFile("productos", archivoGuardado);

    const duplicado = errorDeDuplicado(err);
    if (duplicado) return { values, fieldErrors: duplicado };
    throw err;
  }

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=creado`);
}

// ----------------------------------------------------------------- Editar

export async function editarProductoAction(
  id: number,
  _prev: ProductoFormState,
  formData: FormData,
): Promise<ProductoFormState> {
  await requireAdmin();

  const { values, data: leido, fieldErrors } = parse(formData);

  if (!leido) {
    return { values, fieldErrors };
  }

  const data = await conSlugDisponible(leido, id);
  const actual = await getDb().producto.findUnique({
    where: { id },
    select: { categoriaId: true, imagen: true, modeloId: true },
  });

  if (!actual) {
    return { values, error: "El producto ya no existe." };
  }

  if (data.categoriaId !== actual.categoriaId) {
    const errorCategoria = await validarCategoria(data.categoriaId);

    if (errorCategoria) {
      return { values, fieldErrors: { categoriaId: errorCategoria } };
    }
  }

  const archivo = getArchivo(formData, "imagen");
  const imagen = archivo ? await procesarImagenProducto(archivo) : null;

  if (imagen && !imagen.ok) {
    return { values, fieldErrors: { imagen: imagen.error } };
  }

  // Imagen nueva > quitar imagen > dejar la actual.
  const quitarImagen = !imagen && formData.get("quitarImagen") === "on";
  const archivoNuevo = imagen?.ok ? nombreArchivo("producto", id) : null;
  const cambiaImagen = Boolean(archivoNuevo) || quitarImagen;

  try {
    if (archivoNuevo && imagen?.ok) {
      await saveFile("productos", archivoNuevo, imagen.data);
    }

    // Los modelos son de una sola categoría: si cambia, sale de su modelo.
    const saleDelModelo = actual.modeloId !== null && data.categoriaId !== actual.categoriaId;

    await getDb().$transaction(async (tx) => {
      await tx.producto.update({
        where: { id },
        data: {
          ...datos(data),
          ...(cambiaImagen ? { imagen: archivoNuevo } : {}),
          ...(saleDelModelo ? { modeloId: null, variante: null, ordenVariante: 0 } : {}),
        },
      });

      if (saleDelModelo) {
        await limpiarModelos(tx, [actual.modeloId]);
      }
    });
  } catch (err) {
    await deleteFile("productos", archivoNuevo);

    const duplicado = errorDeDuplicado(err);
    if (duplicado) return { values, fieldErrors: duplicado };
    throw err;
  }

  // Recién con los cambios guardados se borra la imagen reemplazada.
  if (cambiaImagen) {
    await deleteFile("productos", actual.imagen);
  }

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=actualizado`);
}

// --------------------------------------------------------------- Eliminar

export async function eliminarProductoAction(formData: FormData) {
  await requireAdmin();

  const id = productoIdSchema.parse(formData.get("id"));
  const producto = await getDb().producto.findUnique({ where: { id }, select: { imagen: true, modeloId: true } });

  if (producto) {
    await getDb().$transaction(async (tx) => {
      await tx.producto.delete({ where: { id } });
      // Si su modelo queda con un solo producto, se disuelve.
      await limpiarModelos(tx, [producto.modeloId]);
    });
    await deleteFile("productos", producto.imagen);
  }

  updateTag(PRODUCTOS_TAG);
  redirect(`${listaUrl}?ok=eliminado`);
}
