"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAsRider } from "@/lib/actions/rider.actions";
import { Button } from "@/components/ui/button";

export function RiderOrderStatusButtons({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function advance(next: "OUT_FOR_DELIVERY" | "COMPLETED") {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAsRider({ id: orderId, status: next });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (status === "COMPLETED") {
    return <p className="text-sm font-medium text-success">Delivered</p>;
  }

  return (
    <div>
      {(status === "CONFIRMED" || status === "PREPARING") && (
        <Button type="button" isLoading={isPending} onClick={() => advance("OUT_FOR_DELIVERY")}>
          Picked Up — Start Delivery
        </Button>
      )}
      {status === "OUT_FOR_DELIVERY" && (
        <Button type="button" isLoading={isPending} onClick={() => advance("COMPLETED")}>
          Mark Delivered
        </Button>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
