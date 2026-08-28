import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/menu/categories-manager";

export const metadata = { title: "Menu Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Menu Categories</h1>
      <div className="mt-6">
        <CategoriesManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            sortOrder: c.sortOrder,
            isActive: c.isActive,
            itemCount: c._count.items,
          }))}
        />
      </div>
    </div>
  );
}
