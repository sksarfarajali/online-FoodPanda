import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required.").max(100),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});
export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryInput = z.output<typeof categorySchema>;

export const menuItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Category is required."),
  name: z.string().min(1, "Name is required.").max(150),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().max(500).optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  basePrice: z.coerce.number().min(0, "Price must be 0 or more."),
  isVeg: z.coerce.boolean().default(true),
  spiceLevel: z.enum(["NONE", "MILD", "MEDIUM", "HOT"]).default("NONE"),
  isAvailable: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});
export type MenuItemFormInput = z.input<typeof menuItemSchema>;
export type MenuItemInput = z.output<typeof menuItemSchema>;

export const variantSchema = z.object({
  id: z.string().optional(),
  menuItemId: z.string().min(1),
  name: z.string().min(1, "Name is required.").max(60),
  priceDelta: z.coerce.number().default(0),
  isDefault: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});
export type VariantInput = z.infer<typeof variantSchema>;

export const addonSchema = z.object({
  id: z.string().optional(),
  menuItemId: z.string().min(1),
  name: z.string().min(1, "Name is required.").max(60),
  price: z.coerce.number().min(0),
  isAvailable: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
export type AddonInput = z.infer<typeof addonSchema>;
