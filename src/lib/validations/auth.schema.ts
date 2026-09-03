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

// No email/SMS in this app, so "forgot password" is self-service via a security question
// instead of a mailed reset link. A fixed list (rather than a free-text question) keeps every
// account's question reasonably hard to guess/social-engineer.
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city were you born in?",
  "What is your favorite book?",
] as const;

export const securityQuestionSchema = z.object({
  securityQuestion: z.enum(SECURITY_QUESTIONS),
  securityAnswer: z.string().min(2, "Answer is too short.").max(200),
});
export type SecurityQuestionInput = z.infer<typeof securityQuestionSchema>;

export const forgotPasswordLookupSchema = z.object({
  email: z.email("Enter a valid email address."),
});
export type ForgotPasswordLookupInput = z.infer<typeof forgotPasswordLookupSchema>;

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
  securityAnswer: z.string().min(1, "Answer is required."),
  newPassword: passwordField,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordField,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
