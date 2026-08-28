"use client";

import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNumber } from "@/lib/utils";

export interface VariantOption {
  id: string;
  name: string;
  priceDelta: number | string | { toString(): string };
  isDefault: boolean;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number | string | { toString(): string };
  isAvailable: boolean;
}

export interface AddToCartItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  basePrice: number | string | { toString(): string };
  variants: VariantOption[];
  addons: AddonOption[];
}

export function AddToCartControl({ item, currency = "INR" }: { item: AddToCartItem; currency?: string }) {
  const hasOptions = item.variants.length > 0 || item.addons.length > 0;
  const addLine = useCartStore((s) => s.addLine);

  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [simpleAdded, setSimpleAdded] = useState(false);

  const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
  const [variantId, setVariantId] = useState<string | undefined>(defaultVariant?.id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");

  const basePrice = toNumber(item.basePrice);
  const selectedVariant = item.variants.find((v) => v.id === variantId);
  const unitPrice = basePrice + (selectedVariant ? toNumber(selectedVariant.priceDelta) : 0);
  const selectedAddons = item.addons.filter((a) => addonIds.includes(a.id));

  function commitAdd(qty: number) {
    addLine({
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      variantId,
      variantName: selectedVariant?.name,
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: toNumber(a.price) })),
      unitPrice,
      quantity: qty,
      specialInstructions: instructions || undefined,
    });
  }

  if (!hasOptions) {
    return (
      <Button
        type="button"
        size="sm"
        variant={simpleAdded ? "secondary" : "primary"}
        className="w-full"
        onClick={() => {
          commitAdd(1);
          setSimpleAdded(true);
          setTimeout(() => setSimpleAdded(false), 1500);
        }}
      >
        {simpleAdded ? "Added ✓" : "Add to Cart"}
      </Button>
    );
  }

  return (
    <>
      <Button type="button" size="sm" className="w-full" onClick={() => setOpen(true)}>
        Add to Cart
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Customize ${item.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-lg border border-border bg-surface p-5 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">{item.name}</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {item.variants.length > 0 && (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-foreground">Choose an option</legend>
                <div className="mt-2 space-y-2">
                  {item.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex cursor-pointer items-center justify-between rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="variant"
                          checked={variantId === variant.id}
                          onChange={() => setVariantId(variant.id)}
                        />
                        {variant.name}
                      </span>
                      <span className="text-muted">
                        {toNumber(variant.priceDelta) > 0
                          ? `+${formatCurrency(variant.priceDelta, currency)}`
                          : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {item.addons.length > 0 && (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-foreground">Add-ons</legend>
                <div className="mt-2 space-y-2">
                  {item.addons
                    .filter((a) => a.isAvailable)
                    .map((addon) => (
                      <label
                        key={addon.id}
                        className="flex cursor-pointer items-center justify-between rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addonIds.includes(addon.id)}
                            onChange={(e) =>
                              setAddonIds((prev) =>
                                e.target.checked
                                  ? [...prev, addon.id]
                                  : prev.filter((id) => id !== addon.id)
                              )
                            }
                          />
                          {addon.name}
                        </span>
                        <span className="text-muted">+{formatCurrency(addon.price, currency)}</span>
                      </label>
                    ))}
                </div>
              </fieldset>
            )}

            <div className="mt-4">
              <label htmlFor="instructions" className="text-sm font-medium text-foreground">
                Special instructions (optional)
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-accent"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                type="button"
                onClick={() => {
                  commitAdd(quantity);
                  setOpen(false);
                  setQuantity(1);
                }}
              >
                Add · {formatCurrency(unitPrice * quantity, currency)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
