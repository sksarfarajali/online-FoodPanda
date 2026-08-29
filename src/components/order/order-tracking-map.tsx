"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getOrderTrackingSnapshot } from "@/lib/actions/order.actions";

const LiveTrackingMap = dynamic(
  () => import("@/components/shared/live-tracking-map").then((m) => m.LiveTrackingMap),
  { ssr: false, loading: () => <MapPlaceholder text="Loading map…" /> }
);

const POLL_MS = 10_000;
const TERMINAL_STATUSES = new Set(["COMPLETED", "CANCELLED", "PAYMENT_FAILED"]);

type Rider = { name: string; latitude: number; longitude: number };

/**
 * Polls order status via a Server Action rather than a route handler — reuses the same
 * authorization posture the page already had (order-number-only for order-confirmation,
 * or order-number+contact when driven from track-order).
 */
export function OrderTrackingMap({
  orderNumber,
  initialStatus,
  initialRider,
  poll,
}: {
  orderNumber: string;
  initialStatus: string;
  initialRider: Rider | null;
  poll?: () => Promise<{ status: string; rider: Rider | null } | null>;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [rider, setRider] = useState(initialRider);

  useEffect(() => {
    if (TERMINAL_STATUSES.has(status)) return;

    const pollFn = poll ?? (() => getOrderTrackingSnapshot(orderNumber));
    const interval = setInterval(async () => {
      const snapshot = await pollFn();
      if (!snapshot) return;
      setStatus(snapshot.status);
      setRider(snapshot.rider);
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [orderNumber, status, poll]);

  if (status !== "OUT_FOR_DELIVERY") return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-foreground">Live Location</h2>
      <div className="mt-2 h-64">
        {rider ? (
          <LiveTrackingMap latitude={rider.latitude} longitude={rider.longitude} riderName={rider.name} />
        ) : (
          <MapPlaceholder text="Live location unavailable right now." />
        )}
      </div>
    </div>
  );
}

function MapPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-border bg-surface p-6 text-center text-sm text-muted">
      {text}
    </div>
  );
}
