"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CategoryForm } from "./category-form";
import { deleteCategory } from "@/lib/actions/menu.actions";
import { Button } from "@/components/ui/button";
import type { CategoryInput } from "@/lib/validations/menu.schema";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;
}

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryInput | null | undefined>(undefined);

  function close() {
    setEditing(undefined);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setEditing({ name: "", slug: "", sortOrder: 0, isActive: true })}
        >
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-foreground">{category.name}</td>
                <td className="px-4 py-3 text-muted">{category.slug}</td>
                <td className="px-4 py-3 text-muted">{category.itemCount}</td>
                <td className="px-4 py-3 text-muted">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      category.isActive ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
                    }`}
                  >
                    {category.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          id: category.id,
                          name: category.name,
                          slug: category.slug,
                          description: category.description ?? "",
                          sortOrder: category.sortOrder,
                          isActive: category.isActive,
                        })
                      }
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <ConfirmDeleteButton onConfirm={() => deleteCategory(category.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <Modal title={editing?.id ? "Edit Category" : "New Category"} onClose={close}>
          <CategoryForm initial={editing ?? undefined} onSaved={close} />
        </Modal>
      )}
    </div>
  );
}
