import { prisma } from "@/lib/prisma";

export async function getActiveCategoriesWithItems() {
  return prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
        include: { variants: true, addons: true },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.menuCategory.findUnique({
    where: { slug, isActive: true },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
        include: { variants: true, addons: true },
      },
    },
  });
}

export async function getFeaturedItems(limit = 8) {
  return prisma.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: { category: true, variants: true, addons: true },
  });
}

export async function getAllCategoriesForNav() {
  return prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
