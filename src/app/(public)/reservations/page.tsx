import { getSettings } from "@/lib/services/settings.service";
import { ReservationForm } from "@/components/reservation/reservation-form";
import { WhatsAppLink } from "@/components/shared/whatsapp-button";
import { Phone } from "lucide-react";

export const metadata = { title: "Reservations" };

export default async function ReservationsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Reserve a Table</h1>
      <p className="mt-2 text-sm text-muted">
        Fill in the details below and we&apos;ll confirm your reservation shortly.
      </p>

      {settings.reservationEnabled ? (
        <div className="mt-8">
          <ReservationForm maxPartySize={settings.maxPartySize} />
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm text-muted">
          Online reservations are temporarily unavailable. Please contact us directly to book a
          table.
        </div>
      )}

      {(settings.phonePrimary || settings.whatsappNumber) && (
        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <p className="w-full text-sm text-muted">Prefer to talk to us directly?</p>
          {settings.phonePrimary && (
            <a
              href={`tel:${settings.phonePrimary}`}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
            >
              <Phone className="h-4 w-4" /> Call {settings.phonePrimary}
            </a>
          )}
          {settings.whatsappNumber && (
            <WhatsAppLink
              phone={settings.whatsappNumber}
              message={`Hi! I'd like to make a reservation at ${settings.restaurantName}.`}
              className="h-10 border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
            >
              WhatsApp
            </WhatsAppLink>
          )}
        </div>
      )}
    </div>
  );
}
