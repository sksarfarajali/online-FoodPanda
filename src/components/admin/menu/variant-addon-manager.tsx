"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveVariant, deleteVariant, saveAddon, deleteAddon } from "@/lib/actions/menu.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export interface VariantRow {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
}
export interface AddonRow {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export function VariantAddonManager({
  menuItemId,
  variants,
  addons,
  currency,
}: {
  menuItemId: string;
  variants: VariantRow[];
  addons: AddonRow[];
  currency: string;
}) {
  return (
    <div className="mt-6 space-y-6 border-t border-border pt-6">
      <VariantList menuItemId={menuItemId} variants={variants} currency={currency} />
      <AddonList menuItemId={menuItemId} addons={addons} currency={currency} />
    </div>
  );
}

function VariantList({
  menuItemId,
  variants,
  currency,
}: {
  menuItemId: string;
  variants: VariantRow[];
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [priceDelta, setPriceDelta] = useState("0");

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Variants (e.g. Half / Full)</h3>
      <ul className="mt-2 space-y-1">
        {variants.map((v) => (
          <li key={v.id} className="flex items-center justify-between text-sm">
            <span>
              {v.name} {v.isDefault && <span className="text-xs text-muted">(default)</span>}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-muted">
                {v.priceDelta > 0 ? `+${formatCurrency(v.priceDelta, currency)}` : "—"}
              </span>
              <button
                type="button"
                className="text-danger hover:underline"
                onClick={() =>
                  startTransition(async () => {
                    await deleteVariant(v.id);
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            </span>
          </li>
        ))}
        {variants.length === 0 && <li className="text-sm text-muted">No variants yet.</li>}
      </ul>
      <div className="mt-2 flex gap-2">
        <Input placeholder="Name (e.g. Full)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="number"
          step="0.01"
          className="w-28"
          value={priceDelta}
          onChange={(e) => setPriceDelta(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          isLoading={isPending}
          onClick={() =>
            startTransition(async () => {
              if (!name.trim()) return;
              await saveVariant({ menuItemId, name, priceDelta: Number(priceDelta) || 0 });
              setName("");
              setPriceDelta("0");
              router.refresh();
            })
          }
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function AddonList({
  menuItemId,
  addons,
  currency,
}: {
  menuItemId: string;
  addons: AddonRow[];
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Add-ons (e.g. Extra Cheese)</h3>
      <ul className="mt-2 space-y-1">
        {addons.map((a) => (
          <li key={a.id} className="flex items-center justify-between text-sm">
            <span>{a.name}</span>
            <span className="flex items-center gap-3">
              <span className="text-muted">+{formatCurrency(a.price, currency)}</span>
              <button
                type="button"
                className="text-danger hover:underline"
                onClick={() =>
                  startTransition(async () => {
                    await deleteAddon(a.id);
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            </span>
          </li>
        ))}
        {addons.length === 0 && <li className="text-sm text-muted">No add-ons yet.</li>}
      </ul>
      <div className="mt-2 flex gap-2">
        <Input placeholder="Name (e.g. Extra Cheese)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="number"
          step="0.01"
          className="w-28"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          isLoading={isPending}
          onClick={() =>
            startTransition(async () => {
              if (!name.trim()) return;
              await saveAddon({ menuItemId, name, price: Number(price) || 0 });
              setName("");
              setPrice("0");
              router.refresh();
            })
          }
        >
          Add
        </Button>
      </div>
    </div>
  );
}
