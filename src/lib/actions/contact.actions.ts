"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-guards";
import { contactMessageSchema, replyContactMessageSchema } from "@/lib/validations/contact.schema";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function submitContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await getCurrentUser();
  const data = parsed.data;
  await prisma.contactMessage.create({
    data: {
      userId: user?.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    },
  });

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateContactMessageStatus(
  id: string,
  status: "NEW" | "READ" | "RESOLVED"
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/messages");
  return { success: true };
}

/**
 * Admin or Super Admin: reply to a message. Shown to the customer under their own account
 * (/account/messages) if they were signed in when they submitted it — no email or SMS is sent.
 */
export async function replyToContactMessage(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = replyContactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const message = await prisma.contactMessage.findUnique({ where: { id: parsed.data.id } });
  if (!message) {
    return { success: false, error: "Message not found." };
  }

  await prisma.contactMessage.update({
    where: { id: parsed.data.id },
    data: {
      adminReply: parsed.data.reply,
      repliedAt: new Date(),
      repliedByUserId: admin.id,
      status: "RESOLVED",
    },
  });
  revalidatePath("/admin/messages");
  revalidatePath("/account/messages");
  return { success: true };
}
