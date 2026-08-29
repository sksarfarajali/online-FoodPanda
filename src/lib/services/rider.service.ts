import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

const ACTIVE_RIDER_STATUSES = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] as const;

export async function getActiveOrdersForRider(riderId: string) {
  return prisma.order.findMany({
    where: { riderId, status: { in: [...ACTIVE_RIDER_STATUSES] } },
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });
}

export async function getOnDutyRiders() {
  return prisma.user.findMany({
    where: { role: "DELIVERY_RIDER", isActive: true },
    orderBy: [{ isOnDuty: "desc" }, { name: "asc" }],
  });
}

/** A location is only meaningful for "live" display if it's fresh. */
export const LOCATION_STALE_AFTER_MS = 2 * 60 * 1000;

export function isLocationFresh(locationUpdatedAt: Date | null) {
  if (!locationUpdatedAt) return false;
  return Date.now() - locationUpdatedAt.getTime() < LOCATION_STALE_AFTER_MS;
}

export interface VisibleRiderLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface OrderForRiderVisibility {
  orderType: string;
  status: string;
  rider: {
    name: string;
    currentLatitude: number | string | { toString(): string } | null;
    currentLongitude: number | string | { toString(): string } | null;
    locationUpdatedAt: Date | null;
  } | null;
}

/**
 * A rider's live position is only ever surfaced to viewers (customer or admin) while the
 * order is actually out for delivery and the last ping is fresh — otherwise callers get null
 * and should render a fallback rather than a stale/misleading marker.
 */
export function getVisibleRiderLocation(order: OrderForRiderVisibility): VisibleRiderLocation | null {
  const rider = order.rider;
  if (
    order.orderType !== "DELIVERY" ||
    order.status !== "OUT_FOR_DELIVERY" ||
    !rider ||
    rider.currentLatitude === null ||
    rider.currentLongitude === null ||
    !isLocationFresh(rider.locationUpdatedAt)
  ) {
    return null;
  }

  return {
    name: rider.name,
    latitude: toNumber(rider.currentLatitude),
    longitude: toNumber(rider.currentLongitude),
  };
}
