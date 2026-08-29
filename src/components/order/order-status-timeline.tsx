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

/** Renders only for an order's normal happy-path progression — callers should keep their
 *  existing cancelled/payment-failed handling separate rather than feeding those statuses in. */
export function OrderStatusTimeline({ orderType, status }: { orderType: string; status: string }) {
  const steps = STEPS_BY_TYPE[orderType === "PICKUP" ? "PICKUP" : "DELIVERY"];
  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Order Status</h2>
      <ol className="mt-4">
        {steps.map((step, index) => {
          const isDone = currentIndex >= 0 && index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;

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
              <span
                className={`pb-4 text-sm ${
                  isCurrent
                    ? "font-semibold text-foreground"
                    : isDone
                      ? "text-foreground"
                      : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
