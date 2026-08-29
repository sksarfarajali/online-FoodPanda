import { CheckCircle2, Circle } from "lucide-react";

const STEPS_BY_TYPE: Record<"DELIVERY" | "PICKUP", { status: string; label: string }[]> = {
  DELIVERY: [
    { status: "PLACED", label: "Order Placed" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PREPARING", label: "Preparing" },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { status: "COMPLETED", label: "Delivered" },
  ],
  PICKUP: [
    { status: "PLACED", label: "Order Placed" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "PREPARING", label: "Preparing" },
    { status: "READY_FOR_PICKUP", label: "Ready for Pickup" },
    { status: "COMPLETED", label: "Picked Up" },
  ],
};

export interface OrderStatusHistoryEntry {
  status: string;
  at: string | Date;
}

/** Renders only for an order's normal happy-path progression — callers should keep their
 *  existing cancelled/payment-failed handling separate rather than feeding those statuses in. */
export function OrderStatusTimeline({
  orderType,
  status,
  statusHistory,
}: {
  orderType: string;
  status: string;
  /** Per-step timestamps from OrderStatusHistory. Omitted steps just show no time. */
  statusHistory?: OrderStatusHistoryEntry[];
}) {
  const steps = STEPS_BY_TYPE[orderType === "PICKUP" ? "PICKUP" : "DELIVERY"];
  const currentIndex = steps.findIndex((step) => step.status === status);

  // Earliest recorded timestamp per status — a status can only be reached once on the
  // happy path, so the first occurrence is the one worth showing.
  const reachedAt = new Map<string, Date>();
  for (const entry of statusHistory ?? []) {
    if (!reachedAt.has(entry.status)) reachedAt.set(entry.status, new Date(entry.at));
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Order Status</h2>
      <ol className="mt-4">
        {steps.map((step, index) => {
          const isDone = currentIndex >= 0 && index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;
          const timestamp = reachedAt.get(step.status);

          return (
            <li key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                )}
                {!isLast && (
                  <span
                    className={`my-1 w-px flex-1 ${
                      isDone && index < currentIndex ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="pb-4">
                <p
                  className={`text-sm ${
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isDone
                        ? "text-foreground"
                        : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <p className="mt-0.5 text-xs text-muted">
                    {timestamp.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
