import { prisma } from "@/lib/prisma";

export async function getContactMessagesForUser(userId: string) {
  return prisma.contactMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
