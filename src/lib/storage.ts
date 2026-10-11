import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { getServerEnv } from "@/config/server-env";

// Archivos subidos desde el panel, en una carpeta persistente fuera del
// deploy. Se organizan por carpeta ("categorias", "productos"...).

const storageFolders = ["categorias", "productos"] as const;

export type StorageFolder = (typeof storageFolders)[number];

export function isStorageFolder(value: string): value is StorageFolder {
  return (storageFolders as readonly string[]).includes(value);
}

// Nombres generados por la app: letras, números, guiones y una extensión.
const safeFileName = /^[a-z0-9][a-z0-9-]*\.(webp|jpg|png)$/;

function uploadsRoot() {
  return path.resolve(getServerEnv().BRISABEL_UPLOADS_DIR ?? path.join(process.cwd(), "..", "BrisaBel-uploads"));
}

function filePath(folder: StorageFolder, fileName: string) {
  if (!safeFileName.test(fileName)) {
    throw new Error(`Nombre de archivo inválido: ${fileName}`);
  }

  return path.join(uploadsRoot(), folder, fileName);
}

export function isSafeFileName(fileName: string) {
  return safeFileName.test(fileName);
}

export async function saveFile(folder: StorageFolder, fileName: string, data: Buffer) {
  const target = filePath(folder, fileName);

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
}

// Devuelve null si el archivo no existe.
export async function readStoredFile(folder: StorageFolder, fileName: string) {
  try {
    return await readFile(filePath(folder, fileName));
  } catch {
    return null;
  }
}

// Borrar un archivo que ya no existe no es un error.
export async function deleteFile(folder: StorageFolder, fileName: string | null | undefined) {
  if (!fileName || !isSafeFileName(fileName)) {
    return;
  }

  await rm(filePath(folder, fileName), { force: true });
}
