"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  offerSchema,
  type OfferFormInput,
  type OfferInput,
} from "@/lib/validations/offer.schema";
import { saveOffer } from "@/lib/actions/offer.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";

export function OfferForm({ initial, onSaved }: { initial?: OfferInput; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormInput, unknown, OfferInput>({
    resolver: zodResolver(offerSchema),
    defaultValues: initial ?? { title: "", isActive: true, sortOrder: 0 },
  });

  const onSubmit = (data: OfferInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveOffer(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        <FieldError>{errors.title?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={2} {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Promo code (optional)</Label>
          <Input id="code" {...register("code")} />
        </div>
        <div>
          <Label htmlFor="discountPercent">Discount %</Label>
          <Input id="discountPercent" type="number" step="0.01" {...register("discountPercent")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" type="date" {...register("startsAt")} />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends</Label>
          <Input id="endsAt" type="date" {...register("endsAt")} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register("isActive")} /> Active
      </label>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Save Offer
      </Button>
    </form>
  );
}
