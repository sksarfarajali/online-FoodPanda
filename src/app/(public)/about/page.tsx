import Link from "next/link";
import { getSettings } from "@/lib/services/settings.service";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildBaseMetadata(settings, { title: "About", path: "/about" });
}

const SECTIONS = [
  {
    title: "Our Philosophy",
    body: "We believe great food starts with quality ingredients, respect for tradition, and care in every dish we serve.",
  },
  {
    title: "Our Kitchen",
    body: "Our kitchen team prepares each dish fresh, balancing authentic flavours with consistent, thoughtful execution.",
  },
  {
    title: "The Ambience",
    body: "A warm, welcoming space designed for everything from a quick family meal to a special celebration.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="border-b border-border bg-surface py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionHeading
            eyebrow="Our Story"
            title={`About ${settings.restaurantName}`}
            description={settings.description ?? undefined}
            align="center"
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-lg border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm text-muted">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold">Come taste it for yourself</h2>
          <Link
            href="/reservations"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Reserve a Table
          </Link>
        </div>
      </div>
    </div>
  );
}
