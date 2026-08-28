"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  type CategoryFormInput,
  type CategoryInput,
} from "@/lib/validations/menu.schema";
import { saveCategory } from "@/lib/actions/menu.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

export function CategoryForm({
  initial,
  onSaved,
}: {
  initial?: CategoryInput;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial ?? { name: "", slug: "", sortOrder: 0, isActive: true },
  });

  const name = watch("name");

  const onSubmit = (data: CategoryInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveCategory(data);
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
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input id="sortOrder" type="number" {...register("sortOrder")} />
        </div>
        <div className="flex items-end gap-2 pb-2.5">
          <input id="isActive" type="checkbox" {...register("isActive")} />
          <Label htmlFor="isActive" className="mb-0">
            Active (visible on site)
          </Label>
        </div>
      </div>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        {name ? `Save "${name}"` : "Save Category"}
      </Button>
    </form>
  );
}
