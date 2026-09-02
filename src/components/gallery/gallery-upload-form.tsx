"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { submitGalleryPhoto, deleteOwnGalleryPhoto } from "@/lib/actions/gallery.actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export interface MyGalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export function GalleryUploadForm({
  isLoggedIn,
  myPhotos,
}: {
  isLoggedIn: boolean;
  myPhotos: MyGalleryPhoto[];
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center">
        <Camera className="mx-auto h-6 w-6 text-muted" />
        <p className="mt-2 text-sm text-foreground">Have a great photo from your visit?</p>
        <p className="mt-1 text-sm text-muted">
          <Link href="/login?callbackUrl=/gallery" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to share it in our gallery.
        </p>
      </div>
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitGalleryPhoto({ imageUrl, caption });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setImageUrl("");
      setCaption("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">Share your photo</h2>
      <p className="mt-1 text-sm text-muted">Posts immediately to the public gallery.</p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <ImageUploader entity="gallery" value={imageUrl} onChange={setImageUrl} />
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="myCaption">Caption (optional)</Label>
          <Input id="myCaption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} />
        </div>
        <Button type="button" isLoading={isPending} disabled={!imageUrl} onClick={handleSubmit}>
          Post to Gallery
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}

      {myPhotos.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted">Your shared photos</p>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {myPhotos.map((photo) => (
              <div key={photo.id} className="space-y-1.5">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
                  <Image src={photo.imageUrl} alt={photo.caption ?? "Your photo"} fill className="object-cover" />
                </div>
                <ConfirmDeleteButton
                  onConfirm={async () => {
                    const result = await deleteOwnGalleryPhoto(photo.id);
                    if (result.success) router.refresh();
                    return result;
                  }}
                  label="Remove"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
