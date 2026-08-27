"use server";

import { mkdir } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { categoryImagePath, categoryUploadsDir } from "@/lib/uploads";

const categorySchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  descripcion: z.string().trim().max(500).optional(),
  orden: z.coerce.number().int().min(0).max(999999),
  parentId: z.string().trim().optional(),
});

const categoryIdSchema = z.string().trim().min(1).max(40);
const maxImageSizeBytes = 8 * 1024 * 1024;

function redirectWithError(error: string): never {
  redirect(`/admin/categorias?error=${error}`);
}

function revalidateCategories() {
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}

function getImageFile(formData: FormData) {
  const value = formData.get("imagen");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

async function saveCategoryImage(formData: FormData, slug: string) {
  const image = getImageFile(formData);

  if (!image) {
    return undefined;
  }

  if (!image.type.startsWith("image/") || image.size > maxImageSizeBytes) {
    redirectWithError("image");
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const fileName = `${slug}.webp`;
  const filePath = categoryImagePath(fileName);

  try {
    await mkdir(categoryUploadsDir, { recursive: true });
    await sharp(buffer)
      .rotate()
      .resize(1200, 1200, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 82,
        effort: 5,
      })
      .toFile(filePath);
  } catch {
    redirectWithError("image");
  }

  return fileName;
}

async function assertUniqueSlug(slug: string, categoryId?: string) {
  const category = await getPrisma().categoria.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (category && category.id !== categoryId) {
    redirectWithError("duplicate");
  }
}

async function assertValidParent(parentId: string | null, categoryId?: string) {
  if (!parentId) {
    return;
  }

  const prisma = getPrisma();
  const categories = await prisma.categoria.findMany({
    select: {
      id: true,
      parentId: true,
    },
  });

  const parentExists = categories.some((category) => category.id === parentId);

  if (!parentExists || parentId === categoryId) {
    redirectWithError("parent");
  }

  if (!categoryId) {
    return;
  }

  const childrenByParent = new Map<string, string[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    childrenByParent.set(category.parentId, [
      ...(childrenByParent.get(category.parentId) ?? []),
      category.id,
    ]);
  }

  const pending = [...(childrenByParent.get(categoryId) ?? [])];

  while (pending.length > 0) {
    const descendantId = pending.pop();

    if (!descendantId) {
      continue;
    }

    if (descendantId === parentId) {
      redirectWithError("cycle");
    }

    pending.push(...(childrenByParent.get(descendantId) ?? []));
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion"),
    orden: formData.get("orden"),
    parentId: formData.get("parentId"),
  });

  if (!parsed.success) {
    redirect("/admin/categorias?error=invalid");
  }

  const data = parsed.data;
  const parentId = data.parentId || null;

  await assertValidParent(parentId);
  await assertUniqueSlug(data.slug);

  const imagen = await saveCategoryImage(formData, data.slug);

  try {
    await getPrisma().categoria.create({
      data: {
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion || null,
        imagen: imagen ?? null,
        orden: data.orden,
        parentId,
      },
    });
  } catch {
    redirectWithError("duplicate");
  }

  revalidateCategories();
  redirect("/admin/categorias?created=1");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = categoryIdSchema.safeParse(formData.get("id"));
  const parsed = categorySchema.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion"),
    orden: formData.get("orden"),
    parentId: formData.get("parentId"),
  });

  if (!id.success || !parsed.success) {
    redirectWithError("invalid");
  }

  const data = parsed.data;
  const parentId = data.parentId || null;

  await assertValidParent(parentId, id.data);
  await assertUniqueSlug(data.slug, id.data);

  const imagen = await saveCategoryImage(formData, data.slug);

  try {
    await getPrisma().categoria.update({
      where: {
        id: id.data,
      },
      data: {
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion || null,
        ...(imagen ? { imagen } : {}),
        orden: data.orden,
        parentId,
      },
    });
  } catch {
    redirectWithError("duplicate");
  }

  revalidateCategories();
  redirect("/admin/categorias?updated=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = categoryIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    redirectWithError("invalid");
  }

  const category = await getPrisma().categoria.findUnique({
    where: {
      id: id.data,
    },
    select: {
      _count: {
        select: {
          children: true,
          productos: true,
        },
      },
    },
  });

  if (!category) {
    redirectWithError("missing");
  }

  if (category._count.children > 0 || category._count.productos > 0) {
    redirectWithError("relations");
  }

  await getPrisma().categoria.delete({
    where: {
      id: id.data,
    },
  });

  revalidateCategories();
  redirect("/admin/categorias?deleted=1");
}
