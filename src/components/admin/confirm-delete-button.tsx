"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export function ConfirmDeleteButton({
  onConfirm,
  label = "Delete",
}: {
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={label}
        className="inline-flex items-center gap-1 text-sm text-danger hover:underline"
      >
        <Trash2 className="h-3.5 w-3.5" /> {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">Confirm?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await onConfirm();
            if (!result.success) {
              setError(result.error ?? "Could not delete.");
              setConfirming(false);
            }
          })
        }
        className="font-medium text-danger hover:underline disabled:opacity-50"
      >
        Yes
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-muted hover:underline">
        Cancel
      </button>
      {error && <span className="text-danger">{error}</span>}
    </span>
  );
}
