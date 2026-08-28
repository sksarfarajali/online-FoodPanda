import type { Metadata } from "next";
import type { RestaurantSettingsModel } from "@/generated/prisma/models";

export function buildBaseMetadata(
  settings: RestaurantSettingsModel,
  overrides?: { title?: string; description?: string; path?: string }
): Metadata {
  const title = overrides?.title ?? settings.metaTitle ?? settings.restaurantName;
  const description =
    overrides?.description ?? settings.metaDescription ?? settings.tagline ?? undefined;
  const path = overrides?.path ?? "";

  return {
    title,
    description,
    alternates: { canonical: path || "/" },
    openGraph: {
      title,
      description,
      siteName: settings.restaurantName,
      type: "website",
      ...(settings.logoUrl ? { images: [{ url: settings.logoUrl }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/** Restaurant + LocalBusiness structured data, built only from fields that are actually set. */
export function buildRestaurantJsonLd(
  settings: RestaurantSettingsModel,
  aggregateRating?: { average: number | null; count: number } | null
) {
  const address =
    settings.addressLine1 || settings.city
      ? {
          "@type": "PostalAddress",
          ...(settings.addressLine1 ? { streetAddress: settings.addressLine1 } : {}),
          ...(settings.city ? { addressLocality: settings.city } : {}),
          ...(settings.state ? { addressRegion: settings.state } : {}),
          ...(settings.postalCode ? { postalCode: settings.postalCode } : {}),
          addressCountry: settings.country,
        }
      : undefined;

  const geo =
    settings.latitude && settings.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: Number(settings.latitude),
          longitude: Number(settings.longitude),
        }
      : undefined;

  const openingHours = Array.isArray(settings.openingHours)
    ? (settings.openingHours as { day: string; opens: string; closes: string; closed?: boolean }[])
        .filter((entry) => !entry.closed)
        .map((entry) => `${entry.day.slice(0, 2)} ${entry.opens}-${entry.closes}`)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.restaurantName,
    ...(settings.description ? { description: settings.description } : {}),
    ...(address ? { address } : {}),
    ...(geo ? { geo } : {}),
    ...(settings.phonePrimary ? { telephone: settings.phonePrimary } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    servesCuisine: "Indian",
    priceRange: "$$",
    ...(openingHours && openingHours.length > 0 ? { openingHours } : {}),
    ...(aggregateRating && aggregateRating.count > 0 && aggregateRating.average !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.average,
            reviewCount: aggregateRating.count,
          },
        }
      : {}),
    sameAs: [settings.facebookUrl, settings.instagramUrl, settings.twitterUrl, settings.youtubeUrl].filter(
      Boolean
    ),
  };
}
