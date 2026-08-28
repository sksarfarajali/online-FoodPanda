"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validations/settings.schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const user = await requireSuperAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  await prisma.restaurantSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      ...data,
      tagline: data.tagline || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      faviconUrl: data.faviconUrl || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      state: data.state || null,
      postalCode: data.postalCode || null,
      googleMapsEmbedUrl: data.googleMapsEmbedUrl || null,
      phonePrimary: data.phonePrimary || null,
      phoneSecondary: data.phoneSecondary || null,
      whatsappNumber: data.whatsappNumber || null,
      email: data.email || null,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      twitterUrl: data.twitterUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      openingHours: data.openingHours ?? undefined,
      freeDeliveryAbove: data.freeDeliveryAbove ?? null,
      minOrderAmount: data.minOrderAmount ?? null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      updatedById: user.id,
    },
    update: {
      ...data,
      tagline: data.tagline || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      faviconUrl: data.faviconUrl || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      state: data.state || null,
      postalCode: data.postalCode || null,
      googleMapsEmbedUrl: data.googleMapsEmbedUrl || null,
      phonePrimary: data.phonePrimary || null,
      phoneSecondary: data.phoneSecondary || null,
      whatsappNumber: data.whatsappNumber || null,
      email: data.email || null,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      twitterUrl: data.twitterUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      openingHours: data.openingHours ?? undefined,
      freeDeliveryAbove: data.freeDeliveryAbove ?? null,
      minOrderAmount: data.minOrderAmount ?? null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      updatedById: user.id,
    },
  });

  // Settings drive nearly every page (header/footer/SEO/pricing) — revalidate broadly.
  revalidatePath("/", "layout");
  return { success: true };
}
