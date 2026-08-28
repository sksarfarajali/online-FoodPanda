import Link from "next/link";
import { Leaf, ChefHat, ShieldCheck, Truck, Phone } from "lucide-react";
import { getSettings } from "@/lib/services/settings.service";
import { getFeaturedItems } from "@/lib/services/menu.service";
import { getActiveOffers } from "@/lib/services/offer.service";
import { getApprovedReviews, getAverageRating } from "@/lib/services/review.service";
import { getActiveGalleryImages } from "@/lib/services/gallery.service";
import { SectionHeading } from "@/components/shared/section-heading";
import { DishCard } from "@/components/menu/dish-card";
import { ReviewCard } from "@/components/shared/review-card";
import { MapEmbed } from "@/components/shared/map-embed";
import { WhatsAppLink } from "@/components/shared/whatsapp-button";
import { JsonLd } from "@/components/shared/json-ld";
import { buildBaseMetadata, buildRestaurantJsonLd } from "@/lib/seo";
import Image from "next/image";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildBaseMetadata(settings, { path: "/" });
}

const WHY_CHOOSE_US = [
  { icon: Leaf, title: "Fresh Ingredients", description: "Sourced daily and prepared to order." },
  { icon: ChefHat, title: "Authentic Recipes", description: "Traditional recipes, thoughtfully prepared." },
  { icon: ShieldCheck, title: "Hygienic Kitchen", description: "Clean, well-run kitchen you can trust." },
  { icon: Truck, title: "Delivery & Pickup", description: "Order for delivery or pick up at your convenience." },
];

export default async function HomePage() {
  const [settings, featuredItems, offers, reviews, galleryImages, aggregateRating] =
    await Promise.all([
      getSettings(),
      getFeaturedItems(8),
      getActiveOffers(),
      getApprovedReviews(6),
      getActiveGalleryImages(),
      getAverageRating(),
    ]);

  const address = [settings.addressLine1, settings.city, settings.state]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <JsonLd data={buildRestaurantJsonLd(settings, aggregateRating)} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Multi-Cuisine Indian Restaurant
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl md:text-6xl">
            {settings.restaurantName}
          </h1>
          {settings.tagline && (
            <p className="max-w-xl text-lg text-primary-foreground/90">{settings.tagline}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/reservations"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Reserve a Table
            </Link>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] border border-primary-foreground/40 px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Our Story"
          title={`Welcome to ${settings.restaurantName}`}
          description={settings.description ?? undefined}
        />
        <Link href="/about" className="mt-4 inline-block text-sm font-medium text-primary underline">
          Read more about us
        </Link>
      </section>

      {/* Signature dishes */}
      {featuredItems.length > 0 && (
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Menu" title="Signature Dishes" align="center" className="mx-auto" />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => (
                <DishCard key={item.id} item={item} currency={settings.currency} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/menu" className="text-sm font-semibold text-primary underline">
                View Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title="Why Choose Us" align="center" className="mx-auto" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-border bg-surface p-6 text-center">
              <feature.icon className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Deals" title="Special Offers" align="center" className="mx-auto" />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 3).map((offer) => (
                <div key={offer.id} className="rounded-lg border border-border bg-background p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">{offer.title}</h3>
                  {offer.description && <p className="mt-2 text-sm text-muted">{offer.description}</p>}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/offers" className="text-sm font-semibold text-primary underline">
                See all offers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery preview */}
      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Gallery" title="A Taste of the Ambience" align="center" className="mx-auto" />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {galleryImages.slice(0, 8).map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                <Image
                  src={image.imageUrl}
                  alt={image.altText ?? "Restaurant photo"}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/gallery" className="text-sm font-semibold text-primary underline">
              View full gallery
            </Link>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Testimonials" title="What Our Guests Say" align="center" className="mx-auto" />
          {reviews.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  authorName={review.authorName}
                  rating={review.rating}
                  comment={review.comment}
                  source={review.source}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-muted">
              We&apos;re just getting started — check back soon for guest reviews.
            </p>
          )}
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold">Your Table Is Waiting</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/reservations"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Reserve Table
            </Link>
            {settings.phonePrimary && (
              <a
                href={`tel:${settings.phonePrimary}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius)] border border-primary-foreground/40 px-6 text-sm font-semibold hover:bg-primary-foreground/10"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
            )}
            {settings.whatsappNumber && (
              <WhatsAppLink
                phone={settings.whatsappNumber}
                message={`Hi! I'd like to make a reservation at ${settings.restaurantName}.`}
                className="h-12 border border-primary-foreground/40 px-6 text-sm font-semibold hover:bg-primary-foreground/10"
              >
                WhatsApp
              </WhatsAppLink>
            )}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Visit Us" title="Location & Hours" />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="h-72">
            <MapEmbed embedUrl={settings.googleMapsEmbedUrl} addressLabel={address || settings.restaurantName} />
          </div>
          <div className="space-y-2 text-sm text-muted">
            {address && <p>{address}</p>}
            {settings.phonePrimary && <p>Phone: {settings.phonePrimary}</p>}
            {settings.email && <p>Email: {settings.email}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
