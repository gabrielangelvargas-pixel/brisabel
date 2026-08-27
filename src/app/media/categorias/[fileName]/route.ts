import { readFile } from "node:fs/promises";

import {
  categoryImagePath,
  isSafeWebpFileName,
  legacyCategoryImagePath,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

const imageHeaders = {
  "Cache-Control": "public, max-age=3600",
  "Content-Type": "image/webp",
};

async function readCategoryImage(fileName: string) {
  try {
    return await readFile(categoryImagePath(fileName));
  } catch {
    return readFile(legacyCategoryImagePath(fileName));
  }
}

async function getSafeFileName(context: RouteContext<"/media/categorias/[fileName]">) {
  const { fileName } = await context.params;

  if (!isSafeWebpFileName(fileName)) {
    return null;
  }

  return fileName;
}

export async function HEAD(
  _request: Request,
  context: RouteContext<"/media/categorias/[fileName]">,
) {
  const fileName = await getSafeFileName(context);

  if (!fileName) {
    return new Response(null, { status: 404 });
  }

  try {
    await readCategoryImage(fileName);

    return new Response(null, {
      headers: imageHeaders,
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export async function GET(
  _request: Request,
  context: RouteContext<"/media/categorias/[fileName]">,
) {
  const fileName = await getSafeFileName(context);

  if (!fileName) {
    return new Response(null, { status: 404 });
  }

  try {
    const image = await readCategoryImage(fileName);

    return new Response(image, {
      headers: imageHeaders,
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
