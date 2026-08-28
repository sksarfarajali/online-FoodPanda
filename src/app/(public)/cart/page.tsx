"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartSubtotal } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Add some dishes from the menu to get started.</p>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Your Cart</h1>

      <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-surface">
        {lines.map((line) => (
          <div key={line.key} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] bg-background">
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{line.name}</p>
                  {line.variantName && <p className="text-xs text-muted">{line.variantName}</p>}
                  {line.addons.length > 0 && (
                    <p className="text-xs text-muted">
                      + {line.addons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  {line.specialInstructions && (
                    <p className="mt-1 text-xs italic text-muted">
                      &quot;{line.specialInstructions}&quot;
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${line.name} from cart`}
                  onClick={() => removeLine(line.key)}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(line.key, line.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(line.key, line.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(
                    (line.unitPrice + line.addons.reduce((a, x) => a + x.price, 0)) * line.quantity
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted">Subtotal</span>
        <span className="text-lg font-semibold text-foreground">{formatCurrency(subtotal)}</span>
      </div>
      <p className="mt-1 text-xs text-muted">Taxes and delivery fee are calculated at checkout.</p>

      <Link href="/checkout">
        <Button className="mt-6 w-full">Proceed to Checkout</Button>
      </Link>
    </div>
  );
}
