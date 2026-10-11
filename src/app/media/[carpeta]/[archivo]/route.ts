import { isSafeFileName, isStorageFolder, readStoredFile } from "@/lib/storage";

// Sirve archivos subidos desde el panel (/media/categorias/..., /media/productos/...).
// Cada versión de imagen tiene un nombre único, así que se cachea un año.
export async function GET(_request: Request, { params }: RouteContext<"/media/[carpeta]/[archivo]">) {
  const { carpeta, archivo } = await params;

  if (!isStorageFolder(carpeta) || !isSafeFileName(archivo)) {
    return new Response(null, { status: 404 });
  }

  const data = await readStoredFile(carpeta, archivo);

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
