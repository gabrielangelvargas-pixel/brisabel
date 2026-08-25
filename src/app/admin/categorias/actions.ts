"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const categorySchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(160),
  descripcion: z.string().trim().max(500).optional(),
  orden: z.coerce.number().int().min(0).max(999999),
  parentId: z.string().trim().optional(),
});

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

  await getPrisma().categoria.create({
    data: {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion || null,
      orden: data.orden,
      parentId: data.parentId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias?created=1");
}
