import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guards";
import { getSettings } from "@/lib/services/settings.service";
import { toNumber } from "@/lib/utils";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import type { OpeningHoursEntry } from "@/lib/validations/settings.schema";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "SUPER_ADMIN") redirect("/admin");

  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Restaurant Settings</h1>
      <p className="mt-1 text-sm text-muted">
        This information powers the entire public site — header, footer, SEO, and checkout.
      </p>
      <div className="mt-6">
        <SettingsForm
          initial={{
            restaurantName: settings.restaurantName,
            tagline: settings.tagline ?? "",
            description: settings.description ?? "",
            logoUrl: settings.logoUrl ?? "",
            faviconUrl: settings.faviconUrl ?? "",
            addressLine1: settings.addressLine1 ?? "",
            addressLine2: settings.addressLine2 ?? "",
            city: settings.city ?? "",
            state: settings.state ?? "",
            postalCode: settings.postalCode ?? "",
            country: settings.country,
            googleMapsEmbedUrl: settings.googleMapsEmbedUrl ?? "",
            phonePrimary: settings.phonePrimary ?? "",
            phoneSecondary: settings.phoneSecondary ?? "",
            whatsappNumber: settings.whatsappNumber ?? "",
            email: settings.email ?? "",
            facebookUrl: settings.facebookUrl ?? "",
            instagramUrl: settings.instagramUrl ?? "",
            twitterUrl: settings.twitterUrl ?? "",
            youtubeUrl: settings.youtubeUrl ?? "",
            openingHours: Array.isArray(settings.openingHours)
              ? (settings.openingHours as unknown as OpeningHoursEntry[])
              : undefined,
            currency: settings.currency,
            taxPercent: toNumber(settings.taxPercent),
            deliveryFee: toNumber(settings.deliveryFee),
            freeDeliveryAbove: settings.freeDeliveryAbove ? toNumber(settings.freeDeliveryAbove) : undefined,
            minOrderAmount: settings.minOrderAmount ? toNumber(settings.minOrderAmount) : undefined,
            deliveryEnabled: settings.deliveryEnabled,
            pickupEnabled: settings.pickupEnabled,
            reservationEnabled: settings.reservationEnabled,
            maxPartySize: settings.maxPartySize,
            metaTitle: settings.metaTitle ?? "",
            metaDescription: settings.metaDescription ?? "",
          }}
        />
      </div>
    </div>
  );
}
