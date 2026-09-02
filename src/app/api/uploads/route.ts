import { NextResponse } from "next/server";
import { requireAdmin, requireAuth, AuthorizationError } from "@/lib/auth-guards";
import { saveUpload } from "@/lib/storage";

const ALLOWED_ENTITIES = new Set(["menu", "gallery", "offers", "settings"]);
// "gallery" is the one entity a non-admin, signed-in user may upload into (customer photo
// sharing) — every other entity feeds admin-only content and stays admin-gated.
const OPEN_TO_ANY_USER = new Set(["gallery"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const entity = formData.get("entity");
  const entityName = typeof entity === "string" && ALLOWED_ENTITIES.has(entity) ? entity : "misc";

  try {
    if (OPEN_TO_ANY_USER.has(entityName)) {
      await requireAuth();
    } else {
      await requireAdmin();
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
    throw error;
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const url = await saveUpload(file, entityName);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
