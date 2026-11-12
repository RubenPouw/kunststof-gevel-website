export const PHOTO_MAX_FILES = 5;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export type PhotoMeta = {
  name: string;
  type: string;
  size: number;
};

export function photoAllowed(file: PhotoMeta) {
  if (ALLOWED_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

export function photoError(files: PhotoMeta[]) {
  if (files.length > PHOTO_MAX_FILES) return `Hooguit ${PHOTO_MAX_FILES} foto's.`;
  for (const file of files) {
    if (!photoAllowed(file)) return "Alleen jpg, png, heic of webp.";
    if (file.size > PHOTO_MAX_BYTES) return "Een foto is te groot. Maximaal 10 MB per bestand.";
  }
  return null;
}

export function safePhotoName(name: string) {
  const cleaned = name.replace(/[^\w.\- ]+/g, "").trim().slice(0, 80);
  return cleaned || "foto";
}
