"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RatingInput } from "@/components/shared/rating-input";
import { submitReview } from "@/lib/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export interface MyReview {
  rating: number;
  comment: string | null;
  isApproved: boolean;
}

export function ReviewSubmitForm({
  isLoggedIn,
  myReview,
}: {
  isLoggedIn: boolean;
  myReview: MyReview | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center">
        <p className="text-sm text-foreground">Enjoyed your visit?</p>
        <p className="mt-1 text-sm text-muted">
          <Link href="/login?callbackUrl=/reviews" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  function handleSubmit() {
    setError(null);
    if (rating < 1) {
      setError("Pick a rating.");
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ rating, comment });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setJustSubmitted(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">
        {myReview ? "Update your review" : "Leave a review"}
      </h2>

      {myReview && !justSubmitted && (
        <p className="mt-1 text-sm text-muted">
          Your review is{" "}
          <span className={myReview.isApproved ? "font-medium text-success" : "font-medium text-muted"}>
            {myReview.isApproved ? "live on this page" : "awaiting approval"}
          </span>
          . Submitting again will update it.
        </p>
      )}
      {justSubmitted && (
        <p className="mt-1 text-sm text-success">
          Thanks! Your review will appear here once our team approves it.
        </p>
      )}

      <div className="mt-3 space-y-3">
        <div>
          <Label>Rating</Label>
          <div className="mt-1">
            <RatingInput value={rating} onChange={setRating} />
          </div>
        </div>
        <div>
          <Label htmlFor="reviewComment">Comment (optional)</Label>
          <Textarea
            id="reviewComment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="button" isLoading={isPending} onClick={handleSubmit}>
          {myReview ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
