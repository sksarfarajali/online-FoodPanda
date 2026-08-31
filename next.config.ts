import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage (production image uploads) — see lib/storage/vercel-blob.ts
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // org/project/authToken are read from SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN (set by the
  // Vercel Sentry integration) — no need to repeat them here.
  silent: true,
  widenClientFileUpload: true,
});
