"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted">This section failed to load.</p>
      <Button className="mt-4" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
