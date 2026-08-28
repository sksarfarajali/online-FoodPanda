import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      className={cn("animate-pulse rounded-[var(--radius)] bg-border/60", className)}
    />
  );
}
