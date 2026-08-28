"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DishCard, type DishCardItem } from "./dish-card";
import { cn } from "@/lib/utils";

export interface MenuCategoryWithItems {
  id: string;
  name: string;
  slug: string;
  items: DishCardItem[];
}

type DietFilter = "all" | "veg" | "non-veg";

export function MenuBrowser({
  categories,
  currency,
}: {
  categories: MenuCategoryWithItems[];
  currency: string;
}) {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [spicyOnly, setSpicyOnly] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (q && !item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
          if (diet === "veg" && !item.isVeg) return false;
          if (diet === "non-veg" && item.isVeg) return false;
          if (spicyOnly && item.spiceLevel === "NONE") return false;
          return true;
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, query, diet, spicyOnly]);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu"
              aria-label="Search the menu"
              className="h-10 w-full rounded-[var(--radius)] border border-border bg-surface pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-accent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "veg", "non-veg"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={diet === option}
                onClick={() => setDiet(option)}
                className={cn(
                  "h-9 rounded-full border border-border px-3.5 text-xs font-medium capitalize",
                  diet === option ? "bg-primary text-primary-foreground" : "bg-surface text-foreground"
                )}
              >
                {option === "all" ? "All" : option === "veg" ? "Vegetarian" : "Non-Vegetarian"}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={spicyOnly}
              onClick={() => setSpicyOnly((v) => !v)}
              className={cn(
                "h-9 rounded-full border border-border px-3.5 text-xs font-medium",
                spicyOnly ? "bg-primary text-primary-foreground" : "bg-surface text-foreground"
              )}
            >
              Spicy
            </button>
          </div>
        </div>

        <nav
          aria-label="Menu categories"
          className="mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto pb-1"
        >
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-border"
            >
              {category.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {filteredCategories.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">
            No dishes match your search. Try a different filter.
          </p>
        )}

        {filteredCategories.map((category) => (
          <section key={category.id} id={category.slug} className="scroll-mt-40 py-8 first:pt-0">
            <h2 className="font-display text-2xl font-semibold text-foreground">{category.name}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <DishCard key={item.id} item={item} currency={currency} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
