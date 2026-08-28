"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { MenuItemForm } from "./menu-item-form";
import { VariantAddonManager, type VariantRow, type AddonRow } from "./variant-addon-manager";
import { deleteMenuItem, toggleMenuItemAvailability } from "@/lib/actions/menu.actions";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { MenuItemInput } from "@/lib/validations/menu.schema";

export interface ItemRow {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  isVeg: boolean;
  spiceLevel: "NONE" | "MILD" | "MEDIUM" | "HOT";
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  variants: VariantRow[];
  addons: AddonRow[];
}

export function ItemsManager({
  items,
  categories,
  currency,
}: {
  items: ItemRow[];
  categories: { id: string; name: string }[];
  currency: string;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);

  const editingItem = items.find((i) => i.id === editingId);
  const isCreating = editingId === null;

  function close() {
    setEditingId(undefined);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditingId(null)} disabled={categories.length === 0}>
          <Plus className="h-4 w-4" /> New Dish
        </Button>
      </div>
      {categories.length === 0 && (
        <p className="mt-2 text-sm text-muted">Create a category first before adding dishes.</p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Dish</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius)] bg-background">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt="" fill sizes="36px" className="object-cover" />
                      )}
                    </span>
                    {item.name}
                  </span>
                  {item.isFeatured && (
                    <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                      Special
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{item.categoryName}</td>
                <td className="px-4 py-3 text-muted">{formatCurrency(item.basePrice, currency)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMenuItemAvailability(item.id, !item.isAvailable).then(() => router.refresh())
                    }
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.isAvailable ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <ConfirmDeleteButton onConfirm={() => deleteMenuItem(item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No dishes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editingItem) && (
        <Modal title={editingItem ? `Edit ${editingItem.name}` : "New Dish"} onClose={close}>
          <MenuItemForm
            categories={categories}
            initial={
              editingItem
                ? ({
                    id: editingItem.id,
                    categoryId: editingItem.categoryId,
                    name: editingItem.name,
                    slug: editingItem.slug,
                    description: editingItem.description ?? "",
                    imageUrl: editingItem.imageUrl ?? "",
                    basePrice: editingItem.basePrice,
                    isVeg: editingItem.isVeg,
                    spiceLevel: editingItem.spiceLevel,
                    isAvailable: editingItem.isAvailable,
                    isFeatured: editingItem.isFeatured,
                    sortOrder: editingItem.sortOrder,
                  } satisfies MenuItemInput)
                : undefined
            }
            onSaved={close}
          />
          {editingItem && (
            <VariantAddonManager
              menuItemId={editingItem.id}
              variants={editingItem.variants}
              addons={editingItem.addons}
              currency={currency}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
