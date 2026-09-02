import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { getSettings } from "@/lib/services/settings.service";
import { getCurrentUser } from "@/lib/auth-guards";
import { ContactForm } from "@/components/contact/contact-form";
import { MapEmbed } from "@/components/shared/map-embed";

export const metadata = { title: "Contact" };

type OpeningHoursEntry = { day: string; opens: string; closes: string; closed?: boolean };

export default async function ContactPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const address = [settings.addressLine1, settings.addressLine2, settings.city, settings.state]
    .filter(Boolean)
    .join(", ");
  const hours = Array.isArray(settings.openingHours)
    ? (settings.openingHours as unknown as OpeningHoursEntry[])
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Contact Us</h1>
      <p className="mt-2 text-sm text-muted">We&apos;d love to hear from you.</p>

      {!user && (
        <p className="mt-4 text-sm text-muted">
          <Link href="/login?callbackUrl=/contact" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          first so you can see our reply under My Messages once we respond.
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="h-64">
            <MapEmbed embedUrl={settings.googleMapsEmbedUrl} addressLabel={address || settings.restaurantName} />
          </div>

          <ul className="space-y-3 text-sm text-foreground">
            {address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {address}
              </li>
            )}
            {settings.phonePrimary && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`tel:${settings.phonePrimary}`} className="hover:underline">
                  {settings.phonePrimary}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>

          {hours && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Opening Hours</h2>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {hours.map((entry) => (
                  <li key={entry.day} className="flex justify-between gap-4">
                    <span>{entry.day}</span>
                    <span>{entry.closed ? "Closed" : `${entry.opens} – ${entry.closes}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
