import { z } from "zod";

export const galleryImageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Upload an image first."),
  altText: z.string().max(200).optional().or(z.literal("")),
  caption: z.string().max(300).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

export const customerGalleryUploadSchema = z.object({
  imageUrl: z.string().min(1, "Upload an image first."),
  caption: z.string().max(300).optional().or(z.literal("")),
});
export type CustomerGalleryUploadInput = z.infer<typeof customerGalleryUploadSchema>;
