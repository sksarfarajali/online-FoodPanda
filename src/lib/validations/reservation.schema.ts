import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function reservationSchema(maxPartySize: number) {
  return z.object({
    name: z.string().min(1, "Name is required.").max(120),
    email: z.email("Enter a valid email address."),
    phone: z.string().min(7, "Enter a valid phone number.").max(20),
    partySize: z
      .coerce.number()
      .int("Party size must be a whole number.")
      .min(1, "At least 1 guest is required.")
      .max(maxPartySize, `For parties larger than ${maxPartySize}, please call us directly.`),
    reservationDate: z
      .coerce.date()
      .refine((date) => date >= todayAtMidnight(), "Please choose today or a future date."),
    reservationTime: z.string().regex(TIME_PATTERN, "Choose a valid time."),
    specialRequest: z.string().max(500).optional().or(z.literal("")),
  });
}

/** Raw form values before zod coercion (partySize/reservationDate arrive as strings from inputs). */
export type ReservationFormInput = z.input<ReturnType<typeof reservationSchema>>;
/** Coerced values the resolver hands to onSubmit. */
export type ReservationInput = z.output<ReturnType<typeof reservationSchema>>;

export const reservationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
  adminNote: z.string().max(500).optional(),
});
