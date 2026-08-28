"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/validations/review.schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function saveReview(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.review.update({ where: { id }, data });
  } else {
    await prisma.review.create({ data });
  }
  revalidateReviews();
  return { success: true };
}

export async function setReviewApproved(id: string, isApproved: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { isApproved } });
  revalidateReviews();
  return { success: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidateReviews();
  return { success: true };
}
