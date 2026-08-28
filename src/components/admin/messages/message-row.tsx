"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateContactMessageStatus } from "@/lib/actions/contact.actions";

export function MessageRow({
  id,
  status,
  children,
}: {
  id: string;
  status: "NEW" | "READ" | "RESOLVED";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {children}
      <div className="mt-3 flex items-center gap-3">
        <select
          value={current}
          disabled={isPending}
          onChange={(e) => {
            const next = e.target.value as typeof current;
            setCurrent(next);
            startTransition(async () => {
              await updateContactMessageStatus(id, next);
              router.refresh();
            });
          }}
          className="h-8 rounded-[var(--radius)] border border-border bg-background px-2 text-xs text-foreground"
        >
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>
    </div>
  );
}
