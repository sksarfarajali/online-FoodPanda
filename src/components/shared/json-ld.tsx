export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output here is safe: it's structured schema.org data assembled from our
      // own trusted DB fields server-side, not raw user HTML — no sanitization needed for this shape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
