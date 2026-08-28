"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import {
  categorySchema,
  menuItemSchema,
  variantSchema,
  addonSchema,
} from "@/lib/validations/menu.schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function revalidateMenu() {
  revalidatePath("/admin/menu/categories");
  revalidatePath("/admin/menu/items");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function saveCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  try {
    if (id) {
      await prisma.menuCategory.update({ where: { id }, data });
    } else {
      await prisma.menuCategory.create({ data });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A category with that slug already exists." };
    }
    throw error;
  }

  revalidateMenu();
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return {
      success: false,
      error: "Move or delete the dishes in this category first.",
    };
  }
  await prisma.menuCategory.delete({ where: { id } });
  revalidateMenu();
  return { success: true };
}

export async function saveMenuItem(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  try {
    if (id) {
      await prisma.menuItem.update({ where: { id }, data });
    } else {
      await prisma.menuItem.create({ data });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A dish with that slug already exists." };
    }
    throw error;
  }

  revalidateMenu();
  return { success: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidateMenu();
  return { success: true };
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.menuItem.update({ where: { id }, data: { isAvailable } });
  revalidateMenu();
  return { success: true };
}

export async function saveVariant(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.menuItemVariant.update({ where: { id }, data });
  } else {
    await prisma.menuItemVariant.create({ data });
  }
  revalidateMenu();
  return { success: true };
}

export async function deleteVariant(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.menuItemVariant.delete({ where: { id } });
  revalidateMenu();
  return { success: true };
}

export async function saveAddon(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = addonSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.menuItemAddon.update({ where: { id }, data });
  } else {
    await prisma.menuItemAddon.create({ data });
  }
  revalidateMenu();
  return { success: true };
}

export async function deleteAddon(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.menuItemAddon.delete({ where: { id } });
  revalidateMenu();
  return { success: true };
}
