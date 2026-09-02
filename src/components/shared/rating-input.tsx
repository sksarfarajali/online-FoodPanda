"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function RatingInput({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="p-0.5"
          >
            <Star
              className="h-6 w-6"
              fill={star <= display ? "var(--accent)" : "none"}
              stroke="var(--accent)"
            />
          </button>
        );
      })}
    </div>
  );
}
