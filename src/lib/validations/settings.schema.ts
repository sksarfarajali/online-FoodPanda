import { z } from "zod";

export const openingHoursEntrySchema = z.object({
  day: z.string(),
  opens: z.string(),
  closes: z.string(),
  closed: z.boolean().default(false),
});
export type OpeningHoursEntry = z.infer<typeof openingHoursEntrySchema>;

export const settingsSchema = z.object({
  restaurantName: z.string().min(1, "Name is required.").max(150),
  tagline: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  faviconUrl: z.string().optional().or(z.literal("")),

  addressLine1: z.string().max(200).optional().or(z.literal("")),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().min(1).max(100).default("India"),
  googleMapsEmbedUrl: z.string().max(1000).optional().or(z.literal("")),

  phonePrimary: z.string().max(20).optional().or(z.literal("")),
  phoneSecondary: z.string().max(20).optional().or(z.literal("")),
  whatsappNumber: z.string().max(20).optional().or(z.literal("")),
  email: z.string().max(150).optional().or(z.literal("")),

  facebookUrl: z.string().max(300).optional().or(z.literal("")),
  instagramUrl: z.string().max(300).optional().or(z.literal("")),
  twitterUrl: z.string().max(300).optional().or(z.literal("")),
  youtubeUrl: z.string().max(300).optional().or(z.literal("")),

  openingHours: z.array(openingHoursEntrySchema).optional(),

  currency: z.string().min(1).max(10).default("INR"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  deliveryFee: z.coerce.number().min(0).default(0),
  freeDeliveryAbove: z.coerce.number().min(0).optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  deliveryEnabled: z.coerce.boolean().default(true),
  pickupEnabled: z.coerce.boolean().default(true),
  codEnabled: z.coerce.boolean().default(true),
  reservationEnabled: z.coerce.boolean().default(true),
  maxPartySize: z.coerce.number().int().min(1).max(100).default(12),

  metaTitle: z.string().max(150).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
});
export type SettingsFormInput = z.input<typeof settingsSchema>;
export type SettingsInput = z.output<typeof settingsSchema>;
