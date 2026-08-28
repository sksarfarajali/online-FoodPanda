"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log full detail server-side/console only — the visitor sees a friendly message, never a stack trace.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <AlertTriangle className="h-10 w-10 text-danger" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted">
        We hit an unexpected error loading this page. Please try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-border px-5 text-sm font-medium text-foreground hover:bg-surface"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
