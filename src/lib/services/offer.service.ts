import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function getActiveOffers() {
  const now = new Date();
  return prisma.offer.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
}

export type OfferValidationResult =
  | { valid: true; code: string; title: string; discountPercent: number }
  | { valid: false; error: string };

/** Re-checked at order-creation time too — never trust a client-side "applied" state alone,
 *  since the offer can expire or be deactivated between checkout entry and order placement. */
export async function validateOfferCode(rawCode: string): Promise<OfferValidationResult> {
  const code = rawCode.trim();
  if (!code) return { valid: false, error: "Enter a promo code." };

  const now = new Date();
  const offer = await prisma.offer.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  });

  if (!offer) {
    return { valid: false, error: "This promo code is invalid or has expired." };
  }
  if (offer.discountPercent === null) {
    return { valid: false, error: "This promo code cannot be applied to an order." };
  }

  return {
    valid: true,
    code: offer.code!,
    title: offer.title,
    discountPercent: toNumber(offer.discountPercent),
  };
}
