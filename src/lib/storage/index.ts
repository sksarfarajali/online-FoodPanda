import * as local from "./local";
import * as vercelBlob from "./vercel-blob";

/**
 * Storage backend selection. Vercel Blob is used automatically when the project has Blob
 * storage attached (Vercel injects BLOB_READ_WRITE_TOKEN) — this matters because the local
 * filesystem is not writable/persistent on serverless hosts like Vercel. Falls back to local
 * disk for local development.
 */
export async function saveUpload(file: File, entity: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return vercelBlob.saveUpload(file, entity);
  }
  return local.saveUpload(file, entity);
}

/** Dispatches on the URL's own shape, so it works regardless of which backend created it. */
export async function deleteUpload(url: string) {
  if (url.startsWith("http")) {
    return vercelBlob.deleteUpload(url);
  }
  return local.deleteUpload(url);
}
