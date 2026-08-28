import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Vercel Blob-backed storage — used automatically in production when BLOB_READ_WRITE_TOKEN is set. */
export async function saveUpload(file: File, entity: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const pathname = `${entity}/${randomUUID()}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return blob.url;
}

export async function deleteUpload(url: string) {
  if (!url.startsWith("http")) return;
  try {
    await del(url);
  } catch {
    // Already gone — nothing to do.
  }
}
