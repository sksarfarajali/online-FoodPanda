"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCashCollectedAsRider } from "@/lib/actions/rider.actions";
import { Button } from "@/components/ui/button";

export function MarkCashCollectedButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        isLoading={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await markCashCollectedAsRider(orderId);
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
      >
        Mark cash collected
      </Button>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
