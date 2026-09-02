import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/gallery/gallery-manager";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Gallery</h1>
      <div className="mt-6">
        <GalleryManager images={images} />
      </div>
    </div>
  );
}
