"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ReviewForm } from "./review-form";
import { deleteReview, setReviewApproved } from "@/lib/actions/review.actions";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import type { ReviewInput } from "@/lib/validations/review.schema";

export interface ReviewRow {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  source: string | null;
  isApproved: boolean;
}

export function ReviewsManager({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ReviewInput | null | undefined>(undefined);

  function close() {
    setEditing(undefined);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ authorName: "", rating: 5, isApproved: true })}>
          <Plus className="h-4 w-4" /> Add Review
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium text-foreground">{review.authorName}</span>
                  {review.source && <span className="text-xs text-muted">via {review.source}</span>}
                </div>
                {review.comment && <p className="mt-1.5 text-sm text-muted">{review.comment}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  review.isApproved ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
                }`}
              >
                {review.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setReviewApproved(review.id, !review.isApproved).then(() => router.refresh())}
                className="text-sm text-primary hover:underline"
              >
                {review.isApproved ? "Unapprove" : "Approve"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    id: review.id,
                    authorName: review.authorName,
                    rating: review.rating,
                    comment: review.comment ?? "",
                    source: review.source ?? "",
                    isApproved: review.isApproved,
                  })
                }
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <ConfirmDeleteButton onConfirm={() => deleteReview(review.id)} />
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted">No reviews yet. Add one a guest actually gave you.</p>
        )}
      </div>

      {editing !== undefined && (
        <Modal title={editing?.id ? "Edit Review" : "Add Review"} onClose={close}>
          <ReviewForm initial={editing ?? undefined} onSaved={close} />
        </Modal>
      )}
    </div>
  );
}
