import { getActiveGalleryImages } from "@/lib/services/gallery.service";
import { GalleryLightbox } from "@/components/shared/gallery-lightbox";
import { GalleryUploadForm } from "@/components/gallery/gallery-upload-form";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [images, user] = await Promise.all([getActiveGalleryImages(), getCurrentUser()]);
  const myPhotos = user
    ? await prisma.galleryImage.findMany({
        where: { uploadedByUserId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, imageUrl: true, caption: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Gallery</h1>
      <p className="mt-2 text-sm text-muted">A closer look at our food and ambience.</p>

      <div className="mt-8">
        {images.length > 0 ? (
          <GalleryLightbox images={images} />
        ) : (
          <p className="py-16 text-center text-sm text-muted">Photos coming soon.</p>
        )}
      </div>

      <div className="mt-12">
        <GalleryUploadForm isLoggedIn={!!user} myPhotos={myPhotos} />
      </div>
    </div>
  );
}
