import { getPrisma } from "@/lib/prisma";

export async function getCategoryFamilyIds(categoryId: string) {
  const categories = await getPrisma().categoria.findMany({
    select: {
      id: true,
      parentId: true,
    },
  });
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

  const familyIds = [categoryId];
  const pending = [...(childrenByParent.get(categoryId) ?? [])];

  while (pending.length > 0) {
    const currentId = pending.pop();

    if (!currentId) {
      continue;
    }

    familyIds.push(currentId);
    pending.push(...(childrenByParent.get(currentId) ?? []));
  }

  return familyIds;
}
