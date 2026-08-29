import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

// Every page reads live, admin-editable data straight from Postgres (not via fetch()), which
// Next's automatic static/dynamic detection can't see — without this, Vercel's edge can cache
// a response from before an admin change (e.g. serving a stale /setup page after Super Admin
// creation). Force every route to render fresh per-request instead.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Swaad-e-Mehfil",
    template: "%s | Swaad-e-Mehfil",
  },
  description: "Multi-cuisine Indian restaurant.",
};

export const viewport: Viewport = {
  themeColor: "#7a2e2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
