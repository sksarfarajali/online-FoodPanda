import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/services/menu.service";
import { getSettings } from "@/lib/services/settings.service";
import { DishCard } from "@/components/menu/dish-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  return { title: category?.name ?? "Menu" };
}

export default async function MenuCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const [category, settings] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSettings(),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/menu" className="text-sm font-medium text-primary underline">
        ← Full menu
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">{category.name}</h1>
      {category.description && <p className="mt-2 text-sm text-muted">{category.description}</p>}

      {category.items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <DishCard key={item.id} item={item} currency={settings.currency} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">No dishes available in this category right now.</p>
      )}
    </div>
  );
}
