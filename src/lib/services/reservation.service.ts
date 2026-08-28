import { prisma } from "@/lib/prisma";

export async function getReservationsForUser(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { reservationDate: "desc" },
  });
}

export async function getAllReservations() {
  return prisma.reservation.findMany({
    orderBy: [{ reservationDate: "desc" }, { reservationTime: "desc" }],
  });
}
