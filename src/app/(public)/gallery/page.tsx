import { getActiveGalleryImages } from "@/lib/services/gallery.service";
import { GalleryLightbox } from "@/components/shared/gallery-lightbox";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await getActiveGalleryImages();

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
    </div>
  );
}
