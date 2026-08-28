import { z } from "zod";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.");

export const registerCustomerSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  email: z.email("Enter a valid email address."),
  phone: z
    .string()
    .min(7, "Enter a valid phone number.")
    .max(20)
    .optional()
    .or(z.literal("")),
  password: passwordField,
});
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const setupSuperAdminSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  email: z.email("Enter a valid email address."),
  password: passwordField,
});
export type SetupSuperAdminInput = z.infer<typeof setupSuperAdminSchema>;

export const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  email: z.email("Enter a valid email address."),
  password: passwordField,
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
