"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { orderStatusSchema } from "@/lib/validations/order.schema";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type OrderLookupResult =
  | {
      found: true;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      orderType: string;
      totalAmount: string;
      createdAt: string;
    }
  | { found: false };

/** Requires both order number and the phone/email on the order, to avoid enumeration. */
export async function lookupOrder(orderNumber: string, contact: string): Promise<OrderLookupResult> {
  const order = await prisma.order.findUnique({ where: { orderNumber: orderNumber.trim() } });
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
    orderType: order.orderType,
    totalAmount: order.totalAmount.toString(),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function updateOrderStatus(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.order.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/orders");
  return { success: true };
}
