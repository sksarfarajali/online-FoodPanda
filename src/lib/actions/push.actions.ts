"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guards";
import { pushSubscriptionSchema } from "@/lib/validations/push.schema";

export type ActionResult = { success: true } | { success: false; error: string };

/** Saves (or re-links to this account) the browser's push subscription. */
export async function subscribeToPush(input: unknown): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = pushSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid subscription." };
  }
  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  return { success: true };
}

/** Removes this browser's subscription — only the owning account can remove its own. */
export async function unsubscribeFromPush(endpoint: string): Promise<ActionResult> {
  const user = await requireAuth();

  const subscription = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (!subscription || subscription.userId !== user.id) {
    return { success: true }; // Already gone / never existed — nothing to do.
  }

  await prisma.pushSubscription.delete({ where: { endpoint } });
  return { success: true };
}
