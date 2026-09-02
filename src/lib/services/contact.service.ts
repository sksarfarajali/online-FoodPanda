import { prisma } from "@/lib/prisma";

/**
 * Messages linked to this account, plus any guest-submitted message (no account was signed
 * in at the time) whose email matches this account's own verified email — covers a customer
 * who has an account but wasn't logged in when they used the Contact form.
 */
export async function getContactMessagesForUser(userId: string, email: string) {
  return prisma.contactMessage.findMany({
    where: {
      OR: [{ userId }, { userId: null, email: { equals: email, mode: "insensitive" } }],
    },
    orderBy: { createdAt: "desc" },
  });
}
