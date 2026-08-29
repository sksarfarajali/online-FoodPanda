import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/services/settings.service";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/shared/social-icons";

const QUICK_LINKS = [
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/offers", label: "Offers" },
  { href: "/reviews", label: "Reviews" },
  { href: "/reservations", label: "Reservations" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track Order" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund & Cancellation Policy" },
];

type OpeningHoursEntry = { day: string; opens: string; closes: string; closed?: boolean };

function isOpeningHoursArray(value: unknown): value is OpeningHoursEntry[] {
  return Array.isArray(value);
}

export async function Footer() {
  const settings = await getSettings();
  const address = [settings.addressLine1, settings.addressLine2, settings.city, settings.state]
    .filter(Boolean)
    .join(", ");
  const hours = isOpeningHoursArray(settings.openingHours) ? settings.openingHours : null;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <span className="font-display text-lg font-semibold text-primary">
            {settings.restaurantName}
          </span>
          {settings.tagline && <p className="mt-2 text-sm text-muted">{settings.tagline}</p>}
          <div className="mt-4 flex gap-3">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted hover:text-primary"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted hover:text-primary"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted hover:text-primary"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-muted">
            {address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{address}</span>
              </li>
            )}
            {settings.phonePrimary && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${settings.phonePrimary}`} className="hover:text-primary">
                  {settings.phonePrimary}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Opening Hours</h3>
          {hours ? (
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {hours.map((entry) => (
                <li key={entry.day} className="flex justify-between gap-4">
                  <span>{entry.day}</span>
                  <span>{entry.closed ? "Closed" : `${entry.opens} – ${entry.closes}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Hours coming soon.</p>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
