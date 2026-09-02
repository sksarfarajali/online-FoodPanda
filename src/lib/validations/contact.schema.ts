import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120),
  email: z.email("Enter a valid email address."),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().max(150).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required.").max(2000),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const replyContactMessageSchema = z.object({
  id: z.string().min(1),
  reply: z.string().min(1, "Write a reply.").max(2000),
});
export type ReplyContactMessageInput = z.infer<typeof replyContactMessageSchema>;
