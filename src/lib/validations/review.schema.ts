import { z } from "zod";

export const reviewSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().min(1, "Name is required.").max(120),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
  source: z.string().max(60).optional().or(z.literal("")),
  isApproved: z.coerce.boolean().default(false),
});
export type ReviewFormInput = z.input<typeof reviewSchema>;
export type ReviewInput = z.output<typeof reviewSchema>;

export const customerReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick a rating.").max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});
export type CustomerReviewInput = z.infer<typeof customerReviewSchema>;
