import { getActiveOffers } from "@/lib/services/offer.service";
import { getSettings } from "@/lib/services/settings.service";
import { toNumber } from "@/lib/utils";
import { JsonLd } from "@/components/shared/json-ld";
import { buildBaseMetadata } from "@/lib/seo";
import Image from "next/image";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildBaseMetadata(settings, { title: "Offers", path: "/offers" });
}

function formatValidity(startsAt: Date | null, endsAt: Date | null) {
  if (!startsAt && !endsAt) return null;
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (startsAt && endsAt) return `Valid ${fmt(startsAt)} – ${fmt(endsAt)}`;
  if (endsAt) return `Valid until ${fmt(endsAt)}`;
  return `Valid from ${fmt(startsAt!)}`;
}

export default async function OffersPage() {
  const [offers, settings] = await Promise.all([getActiveOffers(), getSettings()]);

  const offersJsonLd =
    offers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: offers.map((offer, index) => ({
            "@type": "Offer",
            position: index + 1,
            name: offer.title,
            ...(offer.description ? { description: offer.description } : {}),
            ...(offer.discountPercent
              ? { discount: toNumber(offer.discountPercent), discountCurrency: settings.currency }
              : {}),
            ...(offer.startsAt ? { validFrom: offer.startsAt.toISOString() } : {}),
            ...(offer.endsAt ? { validThrough: offer.endsAt.toISOString() } : {}),
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      {offersJsonLd && <JsonLd data={offersJsonLd} />}
      <h1 className="font-display text-3xl font-semibold text-foreground">Special Offers</h1>
      <p className="mt-2 text-sm text-muted">Current promotions and deals.</p>

      {offers.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const validity = formatValidity(offer.startsAt, offer.endsAt);
            return (
              <div key={offer.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                {offer.imageUrl && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold text-foreground">{offer.title}</h2>
                    {offer.discountPercent && (
                      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {toNumber(offer.discountPercent)}% off
                      </span>
                    )}
                  </div>
                  {offer.description && <p className="mt-2 text-sm text-muted">{offer.description}</p>}
                  {validity && <p className="mt-3 text-xs text-muted">{validity}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">No active offers right now — check back soon.</p>
      )}
    </div>
  );
}
