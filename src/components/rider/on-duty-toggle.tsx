"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRiderOnDuty } from "@/lib/actions/rider.actions";

export function OnDutyToggle({ isOnDuty }: { isOnDuty: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isOnDuty ? "You're on duty" : "You're off duty"}
        </p>
        <p className="text-xs text-muted">
          {isOnDuty ? "Visible to admin for new assignments." : "Go on duty to receive deliveries."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isOnDuty}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setRiderOnDuty(!isOnDuty);
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          isOnDuty ? "bg-success" : "bg-muted/40"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
            isOnDuty ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
