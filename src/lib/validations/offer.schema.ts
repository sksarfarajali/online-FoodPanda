import { z } from "zod";

export const offerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  code: z.string().max(30).optional().or(z.literal("")),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
export type OfferFormInput = z.input<typeof offerSchema>;
export type OfferInput = z.output<typeof offerSchema>;
