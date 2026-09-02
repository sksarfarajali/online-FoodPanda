"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { galleryImageSchema, customerGalleryUploadSchema } from "@/lib/validations/gallery.schema";
import { deleteUpload } from "@/lib/storage";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// No pre-publish moderation (by design) — this cap just bounds how much any single
// account can flood the public gallery with, since photos go live immediately.
const MAX_USER_UPLOADS = 12;

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

/** Any signed-in user can share a photo to the public gallery — publishes immediately, no admin approval step. */
export async function submitGalleryPhoto(input: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = customerGalleryUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existingCount = await prisma.galleryImage.count({ where: { uploadedByUserId: user.id } });
  if (existingCount >= MAX_USER_UPLOADS) {
    return {
      success: false,
      error: `You've shared the maximum of ${MAX_USER_UPLOADS} photos. Remove one of yours to share another.`,
    };
  }

  await prisma.galleryImage.create({
    data: {
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption || null,
      uploadedByUserId: user.id,
      isActive: true,
    },
  });
  revalidateGallery();
  return { success: true };
}

/** Lets a user remove a photo they submitted themselves — ownership checked server-side. */
export async function deleteOwnGalleryPhoto(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image || image.uploadedByUserId !== user.id) {
    return { success: false, error: "Not authorized." };
  }
  await prisma.galleryImage.delete({ where: { id } });
  await deleteUpload(image.imageUrl);
  revalidateGallery();
  return { success: true };
}
