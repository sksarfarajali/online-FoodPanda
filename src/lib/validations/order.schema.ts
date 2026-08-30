import { z } from "zod";

export const cartLineInputSchema = z.object({
  menuItemId: z.string().min(1),
  variantId: z.string().optional(),
  addonIds: z.array(z.string()).default([]),
  quantity: z.coerce.number().int().min(1).max(50),
  specialInstructions: z.string().max(300).optional(),
});

export const createOrderInputSchema = z
  .object({
    lines: z.array(cartLineInputSchema).min(1, "Your cart is empty."),
    orderType: z.enum(["DELIVERY", "PICKUP"]),
    paymentMethod: z.enum(["ONLINE", "COD"]),
    customerName: z.string().min(1, "Name is required.").max(120),
    customerEmail: z.email("Enter a valid email address."),
    customerPhone: z.string().min(7, "Enter a valid phone number.").max(20),
    deliveryAddressLine1: z.string().max(200).optional(),
    deliveryAddressLine2: z.string().max(200).optional(),
    deliveryCity: z.string().max(100).optional(),
    deliveryPostalCode: z.string().max(20).optional(),
    deliveryInstructions: z.string().max(300).optional(),
    couponCode: z.string().max(30).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
      if (!data.deliveryAddressLine1) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddressLine1"],
          message: "Delivery address is required.",
        });
      }
      if (!data.deliveryCity) {
        ctx.addIssue({ code: "custom", path: ["deliveryCity"], message: "City is required." });
      }
    }
  });
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const verifyPaymentInputSchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "PENDING_PAYMENT",
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED",
    "PAYMENT_FAILED",
  ]),
});
