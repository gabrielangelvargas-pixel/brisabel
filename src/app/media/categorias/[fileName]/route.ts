import { readFile } from "node:fs/promises";

import {
  categoryImagePath,
  isSafeWebpFileName,
  legacyCategoryImagePath,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

async function readCategoryImage(fileName: string) {
  try {
    return await readFile(categoryImagePath(fileName));
  } catch {
    return readFile(legacyCategoryImagePath(fileName));
  }
}

export async function GET(
  _request: Request,
  context: RouteContext<"/media/categorias/[fileName]">,
) {
  const { fileName } = await context.params;

  if (!isSafeWebpFileName(fileName)) {
    return new Response(null, { status: 404 });
  }

  try {
    const image = await readCategoryImage(fileName);

    return new Response(image, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "image/webp",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
