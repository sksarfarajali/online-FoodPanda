"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { reviewSchema, customerReviewSchema } from "@/lib/validations/review.schema";

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

/**
 * Any signed-in user can submit their own review. Goes into the same moderation queue as
 * admin-entered testimonials (isApproved: false) — only shows on /reviews once an admin
 * approves it. One review per account: resubmitting edits the existing one and re-queues it.
 */
export async function submitReview(input: unknown): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = customerReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.review.upsert({
    where: { userId: user.id },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      isApproved: false,
    },
    create: {
      userId: user.id,
      authorName: user.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
      source: "Website",
      isApproved: false,
    },
  });
  revalidateReviews();
  return { success: true };
}
