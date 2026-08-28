"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { galleryImageSchema } from "@/lib/validations/gallery.schema";
import { deleteUpload } from "@/lib/storage";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function saveGalleryImage(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = galleryImageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.galleryImage.update({ where: { id }, data });
  } else {
    await prisma.galleryImage.create({ data });
  }
  revalidateGallery();
  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  await prisma.galleryImage.delete({ where: { id } });
  if (image) await deleteUpload(image.imageUrl);
  revalidateGallery();
  return { success: true };
}
