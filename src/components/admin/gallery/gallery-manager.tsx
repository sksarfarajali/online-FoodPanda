"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { saveGalleryImage, deleteGalleryImage } from "@/lib/actions/gallery.actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export interface GalleryImageRow {
  id: string;
  imageUrl: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
  uploadedBy?: { name: string; email: string } | null;
}

export function GalleryManager({ images }: { images: GalleryImageRow[] }) {
  const router = useRouter();
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Add a photo</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <ImageUploader entity="gallery" value={newUrl} onChange={setNewUrl} />
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="newAlt">Description (for accessibility)</Label>
            <Input id="newAlt" value={newAlt} onChange={(e) => setNewAlt(e.target.value)} />
          </div>
          <Button
            type="button"
            isLoading={isPending}
            disabled={!newUrl}
            onClick={() =>
              startTransition(async () => {
                await saveGalleryImage({ imageUrl: newUrl, altText: newAlt, sortOrder: images.length });
                setNewUrl("");
                setNewAlt("");
                router.refresh();
              })
            }
          >
            Add to Gallery
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <GalleryImageCard key={image.id} image={image} onChanged={() => router.refresh()} />
        ))}
        {images.length === 0 && <p className="text-sm text-muted">No photos yet.</p>}
      </div>
    </div>
  );
}

function GalleryImageCard({
  image,
  onChanged,
}: {
  image: GalleryImageRow;
  onChanged: () => void;
}) {
  const [sortOrder, setSortOrder] = useState(image.sortOrder);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-square w-full">
        <Image src={image.imageUrl} alt={image.altText ?? ""} fill className="object-cover" />
        {image.uploadedBy && (
          <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Shared by customer
          </span>
        )}
      </div>
      <div className="p-3">
        {image.uploadedBy && (
          <p className="mb-2 truncate text-xs text-muted" title={image.uploadedBy.email}>
            {image.uploadedBy.name}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="h-8 w-16 text-xs"
            aria-label="Sort order"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await saveGalleryImage({ id: image.id, imageUrl: image.imageUrl, sortOrder });
                onChanged();
              })
            }
            className="text-xs text-primary hover:underline"
          >
            Save order
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await saveGalleryImage({
                  id: image.id,
                  imageUrl: image.imageUrl,
                  isActive: !image.isActive,
                });
                onChanged();
              })
            }
            className="text-xs text-muted hover:text-foreground"
          >
            {image.isActive ? "Hide" : "Show"}
          </button>
          <ConfirmDeleteButton onConfirm={() => deleteGalleryImage(image.id)} />
        </div>
      </div>
    </div>
  );
}
