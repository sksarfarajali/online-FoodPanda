export function MapEmbed({
  embedUrl,
  addressLabel,
}: {
  embedUrl?: string | null;
  addressLabel?: string | null;
}) {
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title="Restaurant location map"
        className="h-full w-full rounded-lg border border-border"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  if (addressLabel) {
    const query = encodeURIComponent(addressLabel);
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-surface p-6 text-center text-sm font-medium text-primary underline"
      >
        View on Google Maps
      </a>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
      Location coming soon.
    </div>
  );
}
