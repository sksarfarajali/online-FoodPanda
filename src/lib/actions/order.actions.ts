"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { orderStatusSchema } from "@/lib/validations/order.schema";
import { markCashCollected, getOrderByNumber, setOrderStatus } from "@/lib/services/order.service";
import { getVisibleRiderLocation } from "@/lib/services/rider.service";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type StatusHistoryEntry = { status: string; at: string };

export type OrderLookupResult =
  | {
      found: true;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      paymentMethod: string;
      orderType: string;
      totalAmount: string;
      createdAt: string;
      rider: { name: string; latitude: number; longitude: number } | null;
      statusHistory: StatusHistoryEntry[];
    }
  | { found: false };

/** Requires both order number and the phone/email on the order, to avoid enumeration. */
export async function lookupOrder(orderNumber: string, contact: string): Promise<OrderLookupResult> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim() },
    include: {
      rider: {
        select: { name: true, currentLatitude: true, currentLongitude: true, locationUpdatedAt: true },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return { found: false };

  const contactNormalized = contact.trim().toLowerCase();
  const matches =
    order.customerEmail.toLowerCase() === contactNormalized ||
    order.customerPhone.replace(/\D/g, "") === contact.replace(/\D/g, "");

  if (!matches) return { found: false };

  return {
    found: true,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    orderType: order.orderType,
    totalAmount: order.totalAmount.toString(),
    createdAt: order.createdAt.toISOString(),
    rider: getVisibleRiderLocation(order),
    statusHistory: order.statusHistory.map((h) => ({ status: h.status, at: h.createdAt.toISOString() })),
  };
}

export type OrderTrackingSnapshot = {
  status: string;
  rider: { name: string; latitude: number; longitude: number } | null;
} | null;

/**
 * Lightweight polling endpoint for the order-confirmation page. No contact re-check —
 * that page already trusts the order number alone (matches its existing lax gate; see
 * getOrderByNumber usage there), so this reveals nothing the page doesn't already show.
 */
export async function getOrderTrackingSnapshot(orderNumber: string): Promise<OrderTrackingSnapshot> {
  const order = await getOrderByNumber(orderNumber.trim());
  if (!order) return null;
  return { status: order.status, rider: getVisibleRiderLocation(order) };
}

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await setOrderStatus(parsed.data.id, parsed.data.status);

  revalidatePath("/admin/orders");
  return { success: true };
}

/** Admin confirms cash was physically collected for a COD order. */
export async function markOrderCashCollected(orderId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await markCashCollected(orderId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update order.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
