import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

let configured = false;

/** Configures the web-push library once, on first real use — never at module load, so a
 *  missing VAPID env var doesn't crash `next build` or cold-start requests that don't need it. */
function ensureConfigured() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

/** Sends a notification to every browser/device the given user has enabled notifications on.
 *  Best-effort: a subscription the push service reports as gone (410/404) is deleted; any
 *  other failure is swallowed so one bad subscription can't break the caller's transaction. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureConfigured()) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}

const ORDER_STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Your order has been confirmed by the restaurant.",
  PREPARING: "Your order is being prepared.",
  OUT_FOR_DELIVERY: "Your order is out for delivery!",
  READY_FOR_PICKUP: "Your order is ready for pickup.",
  COMPLETED: "Your order has been delivered. Enjoy!",
  CANCELLED: "Your order was cancelled.",
};

/** Notifies the customer who placed an order that its status changed. No-op for guest orders
 *  (no userId) or statuses that aren't customer-facing (e.g. PENDING_PAYMENT). */
export async function notifyOrderStatusChange(order: { id: string; orderNumber: string; userId: string | null; status: OrderStatus }) {
  if (!order.userId) return;
  const body = ORDER_STATUS_MESSAGES[order.status];
  if (!body) return;

  await sendPushToUser(order.userId, {
    title: `Order ${order.orderNumber}`,
    body,
    url: `/order-confirmation/${order.orderNumber}`,
  });
}

/** Notifies a rider they've been assigned a new delivery. */
export async function notifyRiderAssigned(riderId: string, orderNumber: string) {
  await sendPushToUser(riderId, {
    title: "New delivery assigned",
    body: `Order ${orderNumber} has been assigned to you.`,
    url: "/rider",
  });
}
