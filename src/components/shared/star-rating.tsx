import { Star } from "lucide-react";

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          aria-hidden="true"
          fill={i < rating ? "var(--accent)" : "none"}
          stroke="var(--accent)"
        />
      ))}
    </span>
  );
}
