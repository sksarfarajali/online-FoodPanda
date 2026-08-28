import Image from "next/image";
import { Flame } from "lucide-react";
import { VegIndicator } from "./veg-indicator";
import { formatCurrency, toNumber } from "@/lib/utils";
import type { SpiceLevel } from "@/generated/prisma/enums";
import { AddToCartControl, type VariantOption, type AddonOption } from "@/components/cart/add-to-cart-control";

export interface DishCardItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number | string | { toString(): string };
  isVeg: boolean;
  spiceLevel: SpiceLevel;
  isFeatured: boolean;
  variants?: VariantOption[];
  addons?: AddonOption[];
}

const SPICE_COUNT: Record<SpiceLevel, number> = {
  NONE: 0,
  MILD: 1,
  MEDIUM: 2,
  HOT: 3,
};

export function DishCard({ item, currency = "INR" }: { item: DishCardItem; currency?: string }) {
  const spiceCount = SPICE_COUNT[item.spiceLevel];

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            No image yet
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Chef&apos;s Special
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <VegIndicator isVeg={item.isVeg} />
            <h3 className="font-display text-base font-semibold text-foreground">{item.name}</h3>
          </div>
          {spiceCount > 0 && (
            <span
              className="flex shrink-0 items-center gap-0.5"
              role="img"
              aria-label={`Spice level: ${item.spiceLevel.toLowerCase()}`}
              title={`Spice level: ${item.spiceLevel.toLowerCase()}`}
            >
              {Array.from({ length: spiceCount }).map((_, i) => (
                <Flame key={i} className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
              ))}
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.description}</p>
        )}

        <p className="mt-3 text-base font-semibold text-foreground">
          {formatCurrency(toNumber(item.basePrice), currency)}
        </p>

        <div className="mt-3">
          <AddToCartControl
            item={{
              id: item.id,
              name: item.name,
              imageUrl: item.imageUrl,
              basePrice: item.basePrice,
              variants: item.variants ?? [],
              addons: item.addons ?? [],
            }}
            currency={currency}
          />
        </div>
      </div>
    </article>
  );
}
