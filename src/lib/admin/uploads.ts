import "server-only";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
};

export type Upload = { buffer: Buffer; contentType: string; ext: string };
export type PhotoUpload = Upload & { width: number; height: number };

/** Returns the File from a form field, or null if it is missing, empty or too large. */
export function formFile(form: FormData, name: string): File | null {
  const f = form.get(name);
  if (!(f instanceof File) || f.size === 0 || f.size > MAX_UPLOAD_BYTES) return null;
  return f;
}

/**
 * Validates an image by decoding it, fixes its orientation, shrinks it to
 * `maxSide` and re-encodes it (which also strips EXIF such as GPS location).
 */
export async function processImage(file: File, maxSide: number, format: "webp" | "png"): Promise<PhotoUpload | null> {
  try {
    const pipeline = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true });
    const { data, info } = await (format === "webp" ? pipeline.webp({ quality: 85 }) : pipeline.png()).toBuffer({
      resolveWithObject: true,
    });
    return { buffer: data, contentType: `image/${format}`, ext: format, width: info.width, height: info.height };
  } catch {
    return null; // not a decodable image
  }
}

export async function readAudio(file: File): Promise<Upload | null> {
  const ext = AUDIO_TYPES[file.type];
  if (!ext) return null;
  return { buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type, ext };
}
