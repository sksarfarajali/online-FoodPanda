"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignRider } from "@/lib/actions/rider.actions";
import { Button } from "@/components/ui/button";

export interface RiderOption {
  id: string;
  name: string;
  isOnDuty: boolean;
}

export function AssignRiderForm({
  orderId,
  currentRiderId,
  riders,
}: {
  orderId: string;
  currentRiderId: string | null;
  riders: RiderOption[];
}) {
  const router = useRouter();
  const [riderId, setRiderId] = useState(currentRiderId ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <select
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
        className="h-10 rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground"
      >
        <option value="">Unassigned</option>
        {riders.map((rider) => (
          <option key={rider.id} value={rider.id}>
            {rider.name} {rider.isOnDuty ? "· on duty" : "· off duty"}
          </option>
        ))}
      </select>
      <Button
        type="button"
        size="sm"
        isLoading={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await assignRider({ orderId, riderId: riderId || null });
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
      >
        {currentRiderId ? "Update Rider" : "Assign Rider"}
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
