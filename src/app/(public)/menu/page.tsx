import { getActiveCategoriesWithItems } from "@/lib/services/menu.service";
import { getSettings } from "@/lib/services/settings.service";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { JsonLd } from "@/components/shared/json-ld";
import { buildBaseMetadata } from "@/lib/seo";
import { toNumber } from "@/lib/utils";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildBaseMetadata(settings, { title: "Menu", path: "/menu" });
}

export default async function MenuPage() {
  const [categories, settings] = await Promise.all([
    getActiveCategoriesWithItems(),
    getSettings(),
  ]);

  const menuJsonLd =
    categories.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Menu",
          name: `${settings.restaurantName} Menu`,
          hasMenuSection: categories.map((category) => ({
            "@type": "MenuSection",
            name: category.name,
            hasMenuItem: category.items.map((item) => ({
              "@type": "MenuItem",
              name: item.name,
              ...(item.description ? { description: item.description } : {}),
              offers: {
                "@type": "Offer",
                price: toNumber(item.basePrice),
                priceCurrency: settings.currency,
              },
            })),
          })),
        }
      : null;

  return (
    <div>
      {menuJsonLd && <JsonLd data={menuJsonLd} />}
      <div className="border-b border-border bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-foreground">Our Menu</h1>
          <p className="mt-2 text-sm text-muted">
            {categories.length > 0
              ? "Browse our full menu, or search and filter to find exactly what you're craving."
              : "The menu is being updated — please check back shortly."}
          </p>
        </div>
      </div>
      {categories.length > 0 && <MenuBrowser categories={categories} currency={settings.currency} />}
    </div>
  );
}
