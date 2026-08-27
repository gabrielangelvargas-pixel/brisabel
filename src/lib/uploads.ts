import path from "node:path";

const defaultUploadsDir = path.resolve(process.cwd(), "..", "BrisaBel-uploads");

export const uploadsRootDir = process.env.BRISABEL_UPLOADS_DIR
  ? path.resolve(process.env.BRISABEL_UPLOADS_DIR)
  : defaultUploadsDir;

export const categoryUploadsDir = path.join(uploadsRootDir, "categorias");

export function categoryImagePath(fileName: string) {
  return path.join(categoryUploadsDir, fileName);
}

export function legacyCategoryImagePath(fileName: string) {
  return path.join(process.cwd(), "public", "images", "categorias", fileName);
}

export function isSafeWebpFileName(fileName: string) {
  return /^[a-z0-9][a-z0-9._-]*\.webp$/i.test(fileName) && !fileName.includes("..");
}
