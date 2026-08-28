import { NextResponse } from "next/server";
import { requireAdmin, AuthorizationError } from "@/lib/auth-guards";
import { saveUpload } from "@/lib/storage";

const ALLOWED_ENTITIES = new Set(["menu", "gallery", "offers", "settings"]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
    throw error;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const entity = formData.get("entity");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const entityName = typeof entity === "string" && ALLOWED_ENTITIES.has(entity) ? entity : "misc";

  try {
    const url = await saveUpload(file, entityName);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    // TEMPORARY diagnostic (admin-only route, safe to expose a boolean) — remove once
    // the Blob-storage detection issue is confirmed fixed.
    const diagnostic = `blobTokenPresent=${Boolean(process.env.BLOB_READ_WRITE_TOKEN)}`;
    return NextResponse.json({ error: `${message} [${diagnostic}]` }, { status: 400 });
  }
}
