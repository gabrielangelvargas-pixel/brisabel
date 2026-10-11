import { isSafeFileName, readStoredFile } from "@/lib/storage";

// Sirve las imágenes de categorías desde la carpeta persistente de uploads.
// Cada versión de imagen tiene un nombre único, así que se cachea un año.
export async function GET(_request: Request, { params }: RouteContext<"/media/categorias/[archivo]">) {
  const { archivo } = await params;

  if (!isSafeFileName(archivo)) {
    return new Response(null, { status: 404 });
  }

  const data = await readStoredFile("categorias", archivo);

  if (!data) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
