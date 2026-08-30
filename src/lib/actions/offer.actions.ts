"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { offerSchema } from "@/lib/validations/offer.schema";
import { validateOfferCode, type OfferValidationResult } from "@/lib/services/offer.service";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

/** Public — lets checkout preview a discount before placing the order. The order-creation
 *  route re-validates independently; this alone never authorizes a discount on a real order. */
export async function checkPromoCode(code: string): Promise<OfferValidationResult> {
  return validateOfferCode(code);
}

export async function saveOffer(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, code, discountPercent, startsAt, endsAt, ...rest } = parsed.data;

  const data = {
    ...rest,
    code: code || null,
    discountPercent: discountPercent ?? null,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
  };

  if (id) {
    await prisma.offer.update({ where: { id }, data });
  } else {
    await prisma.offer.create({ data });
  }

  revalidatePath("/admin/offers");
  revalidatePath("/offers");
  revalidatePath("/");
  return { success: true };
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offers");
  revalidatePath("/offers");
  revalidatePath("/");
  return { success: true };
}
