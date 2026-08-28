"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reviewSchema,
  type ReviewFormInput,
  type ReviewInput,
} from "@/lib/validations/review.schema";
import { saveReview } from "@/lib/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";

export function ReviewForm({ initial, onSaved }: { initial?: ReviewInput; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormInput, unknown, ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initial ?? { authorName: "", rating: 5, isApproved: true },
  });

  const onSubmit = (data: ReviewInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveReview(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted">
        Only enter reviews a guest actually gave you (in person, by phone, or copied from Google/other
        platforms). Never invent reviews.
      </p>
      <div>
        <Label htmlFor="authorName">Guest name</Label>
        <Input id="authorName" {...register("authorName")} />
        <FieldError>{errors.authorName?.message}</FieldError>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input id="rating" type="number" min={1} max={5} {...register("rating")} />
          <FieldError>{errors.rating?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="source">Source (optional)</Label>
          <Input id="source" placeholder="Google, Direct..." {...register("source")} />
        </div>
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea id="comment" rows={3} {...register("comment")} />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register("isApproved")} /> Approved (visible on site)
      </label>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Save Review
      </Button>
    </form>
  );
}
