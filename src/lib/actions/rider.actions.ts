"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireRole } from "@/lib/auth-guards";
import {
  createRiderSchema,
  assignRiderSchema,
  riderOrderStatusSchema,
  type CreateRiderInput,
  type AssignRiderInput,
  type RiderOrderStatusInput,
} from "@/lib/validations/rider.schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

const HASH_ROUNDS = 12;

/** Admin or Super Admin: create a new delivery rider account (restaurant's own staff). */
export async function createRiderAccount(input: CreateRiderInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createRiderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, vehicleNumber, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        vehicleNumber: vehicleNumber || null,
        passwordHash,
        role: "DELIVERY_RIDER",
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "An account with that email already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/riders");
  return { success: true };
}

/** Admin or Super Admin: activate/deactivate a rider account (soft — preserves order history). */
export async function setRiderActive(riderId: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: riderId } });
  if (!target || target.role !== "DELIVERY_RIDER") {
    return { success: false, error: "Rider account not found." };
  }

  await prisma.user.update({
    where: { id: riderId },
    data: isActive ? { isActive } : { isActive, isOnDuty: false },
  });

  revalidatePath("/admin/riders");
  return { success: true };
}

/** Admin or Super Admin: assign (or unassign, riderId: null) a rider to a delivery order. */
export async function assignRider(input: AssignRiderInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = assignRiderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { orderId, riderId } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { success: false, error: "Order not found." };
  }
  if (order.orderType !== "DELIVERY") {
    return { success: false, error: "Only delivery orders can be assigned a rider." };
  }

  if (riderId) {
    const rider = await prisma.user.findUnique({ where: { id: riderId } });
    if (!rider || rider.role !== "DELIVERY_RIDER" || !rider.isActive) {
      return { success: false, error: "Selected rider is not available." };
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: { riderId } });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

/** Rider only: toggles the current rider's own on-duty status. */
export async function setRiderOnDuty(isOnDuty: boolean): Promise<ActionResult> {
  const user = await requireRole(["DELIVERY_RIDER"]);

  await prisma.user.update({ where: { id: user.id }, data: { isOnDuty } });

  revalidatePath("/rider");
  return { success: true };
}

/**
 * Rider only: advance the status of an order assigned to them.
 * Ownership check (order.riderId === session user id) is the real security boundary here —
 * without it, any rider could update any other rider's deliveries.
 */
export async function updateOrderStatusAsRider(input: RiderOrderStatusInput): Promise<ActionResult> {
  const user = await requireRole(["DELIVERY_RIDER"]);

  const parsed = riderOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, status } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.riderId !== user.id) {
    return { success: false, error: "This order is not assigned to you." };
  }

  await prisma.order.update({ where: { id }, data: { status } });

  revalidatePath("/rider");
  revalidatePath(`/rider/orders/${id}`);
  return { success: true };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
