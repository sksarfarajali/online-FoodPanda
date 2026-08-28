import { prisma } from "@/lib/prisma";

export async function getActiveGalleryImages() {
  return prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
