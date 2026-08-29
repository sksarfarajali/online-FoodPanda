import { z } from "zod";

export const createRiderSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  email: z.email("Enter a valid email address."),
  phone: z.string().max(20).optional().or(z.literal("")),
  vehicleNumber: z.string().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});
export type CreateRiderInput = z.infer<typeof createRiderSchema>;

export const updateRiderLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
export type UpdateRiderLocationInput = z.infer<typeof updateRiderLocationSchema>;

export const assignRiderSchema = z.object({
  orderId: z.string().min(1),
  riderId: z.string().min(1).nullable(),
});
export type AssignRiderInput = z.infer<typeof assignRiderSchema>;

// Deliberately narrower than admin's orderStatusSchema — a rider can only advance a delivery
// through these two states, never set CANCELLED/PENDING_PAYMENT/etc.
export const riderOrderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["OUT_FOR_DELIVERY", "COMPLETED"]),
});
export type RiderOrderStatusInput = z.infer<typeof riderOrderStatusSchema>;
