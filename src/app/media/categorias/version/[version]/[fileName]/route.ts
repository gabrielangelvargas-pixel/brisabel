import { readFile } from "node:fs/promises";
import path from "node:path";

import { appConfig } from "@/config/app";
import {
  categoryImagePath,
  isSafeWebpFileName,
  legacyCategoryImagePath,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

const imageHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "image/webp",
};

async function readCategoryImage(fileName: string) {
  try {
    return await readFile(categoryImagePath(fileName));
  } catch {
    try {
      return await readFile(legacyCategoryImagePath(fileName));
    } catch {
      return readFile(
        path.join(process.cwd(), "public", appConfig.image.replace(/^\//, "")),
      );
    }
  }
}

async function getSafeFileName(
  context: RouteContext<"/media/categorias/version/[version]/[fileName]">,
) {
  const { fileName, version } = await context.params;

  if (!/^\d+$/.test(version) || !isSafeWebpFileName(fileName)) {
    return null;
  }

  return fileName;
}

export async function HEAD(
  _request: Request,
  context: RouteContext<"/media/categorias/version/[version]/[fileName]">,
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
  context: RouteContext<"/media/categorias/version/[version]/[fileName]">,
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
