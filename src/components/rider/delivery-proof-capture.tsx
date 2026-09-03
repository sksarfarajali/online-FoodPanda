"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { uploadDeliveryProof } from "@/lib/actions/rider.actions";
import { Button } from "@/components/ui/button";

/** Lets the rider take a handover photo with the phone's camera at the customer's door and
 *  attach it to the order. `capture="environment"` opens the rear camera directly on mobile
 *  instead of a generic file picker; desktop browsers just fall back to a file chooser. */
export function DeliveryProofCapture({ orderId, existingUrl }: { orderId: string; existingUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity", "delivery-proof");
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      const result = await uploadDeliveryProof({ orderId, imageUrl: data.url });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">Handover Photo</h2>

      {existingUrl && (
        <div className="relative mt-2 h-40 w-full overflow-hidden rounded-[var(--radius)] border border-border">
          <Image src={existingUrl} alt="Delivery proof" fill className="object-cover" />
        </div>
      )}

      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          {isUploading ? "Uploading…" : existingUrl ? "Retake photo" : "Take photo"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
