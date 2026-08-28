"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-guards";
import { getSettings } from "@/lib/services/settings.service";
import { reservationSchema, reservationStatusSchema } from "@/lib/validations/reservation.schema";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createReservation(input: unknown): Promise<ActionResult> {
  const settings = await getSettings();
  if (!settings.reservationEnabled) {
    return { success: false, error: "Reservations are temporarily unavailable. Please call us." };
  }

  const parsed = reservationSchema(settings.maxPartySize).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await getCurrentUser();
  const data = parsed.data;

  await prisma.reservation.create({
    data: {
      userId: user?.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      partySize: data.partySize,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      specialRequest: data.specialRequest || null,
    },
  });

  revalidatePath("/admin/reservations");
  return { success: true };
}

export async function updateReservationStatus(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reservationStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.reservation.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, adminNote: parsed.data.adminNote || null },
  });

  revalidatePath("/admin/reservations");
  return { success: true };
}
