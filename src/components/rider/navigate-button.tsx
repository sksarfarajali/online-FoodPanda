import { Navigation } from "lucide-react";

/** Opens the customer's delivery address in Google Maps turn-by-turn directions — opens the
 *  native Google Maps app on Android/iOS if installed, else falls back to the web. Plain link,
 *  no API key or geocoding needed since Maps accepts a free-text destination address. */
export function NavigateButton({ address }: { address: string }) {
  const href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex h-9 items-center gap-2 rounded-[var(--radius)] bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      <Navigation className="h-4 w-4" />
      Navigate
    </a>
  );
}
