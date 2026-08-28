"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/order.actions";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "PENDING_PAYMENT",
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
  "PAYMENT_FAILED",
] as const;

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <Button
        type="button"
        size="sm"
        isLoading={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateOrderStatus({ id: orderId, status });
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
      >
        Update Status
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
