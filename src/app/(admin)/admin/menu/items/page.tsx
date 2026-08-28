import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings.service";
import { ItemsManager } from "@/components/admin/menu/items-manager";
import { toNumber } from "@/lib/utils";

export const metadata = { title: "Menu Items" };

export default async function AdminMenuItemsPage() {
  const [items, categories, settings] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
      include: { category: true, variants: { orderBy: { sortOrder: "asc" } }, addons: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.menuCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Menu Items</h1>
      <div className="mt-6">
        <ItemsManager
          currency={settings.currency}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          items={items.map((item) => ({
            id: item.id,
            categoryId: item.categoryId,
            categoryName: item.category.name,
            name: item.name,
            slug: item.slug,
            description: item.description,
            basePrice: toNumber(item.basePrice),
            isVeg: item.isVeg,
            spiceLevel: item.spiceLevel,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            sortOrder: item.sortOrder,
            variants: item.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceDelta: toNumber(v.priceDelta),
              isDefault: v.isDefault,
            })),
            addons: item.addons.map((a) => ({
              id: a.id,
              name: a.name,
              price: toNumber(a.price),
              isAvailable: a.isAvailable,
            })),
          }))}
        />
      </div>
    </div>
  );
}
