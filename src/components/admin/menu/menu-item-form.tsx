"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  menuItemSchema,
  type MenuItemFormInput,
  type MenuItemInput,
} from "@/lib/validations/menu.schema";
import { saveMenuItem } from "@/lib/actions/menu.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export function MenuItemForm({
  categories,
  initial,
  onSaved,
}: {
  categories: { id: string; name: string }[];
  initial?: MenuItemInput;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MenuItemFormInput, unknown, MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initial ?? {
      categoryId: categories[0]?.id ?? "",
      name: "",
      slug: "",
      basePrice: 0,
      isVeg: true,
      spiceLevel: "NONE",
      isAvailable: true,
      isFeatured: false,
      sortOrder: 0,
    },
  });

  const onSubmit = (data: MenuItemInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveMenuItem(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 text-sm text-foreground"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError>{errors.categoryId?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name", {
            onChange: (e) => {
              if (!initial) setValue("slug", slugify(e.target.value));
            },
          })}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} />
        <FieldError>{errors.slug?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={2} {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Price</Label>
          <Input id="basePrice" type="number" step="0.01" {...register("basePrice")} />
          <FieldError>{errors.basePrice?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="spiceLevel">Spice level</Label>
          <select
            id="spiceLevel"
            {...register("spiceLevel")}
            className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 text-sm text-foreground"
          >
            <option value="NONE">None</option>
            <option value="MILD">Mild</option>
            <option value="MEDIUM">Medium</option>
            <option value="HOT">Hot</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register("isVeg")} /> Vegetarian
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register("isAvailable")} /> Available
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register("isFeatured")} /> Chef&apos;s Special
        </label>
      </div>
      <div>
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" type="number" {...register("sortOrder")} />
      </div>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Save Dish
      </Button>
    </form>
  );
}
