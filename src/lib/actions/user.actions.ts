"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { requireSuperAdmin, requireAdmin } from "@/lib/auth-guards";
import {
  registerCustomerSchema,
  setupSuperAdminSchema,
  createAdminSchema,
  loginSchema,
  type RegisterCustomerInput,
  type SetupSuperAdminInput,
  type CreateAdminInput,
  type LoginInput,
} from "@/lib/validations/auth.schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

const HASH_ROUNDS = 12;

/**
 * Creates the very first Super Admin. Only succeeds while no SUPER_ADMIN exists —
 * this is the real security boundary (Proxy does not gate /setup). After the first
 * Super Admin is created, this action always fails and further admins are created
 * from /admin/users by an existing Super Admin.
 */
export async function setupSuperAdmin(
  input: SetupSuperAdminInput
): Promise<ActionResult> {
  const parsed = setupSuperAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existingSuperAdminCount = await prisma.user.count({
    where: { role: "SUPER_ADMIN" },
  });
  if (existingSuperAdminCount > 0) {
    return {
      success: false,
      error: "Setup has already been completed. Please log in instead.",
    };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);

  try {
    await prisma.$transaction(async (tx) => {
      const stillZero = await tx.user.count({ where: { role: "SUPER_ADMIN" } });
      if (stillZero > 0) {
        throw new Error("Setup has already been completed. Please log in instead.");
      }
      await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          role: "SUPER_ADMIN",
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already been completed")) {
      return { success: false, error: error.message };
    }
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "An account with that email already exists." };
    }
    throw error;
  }

  await signIn("credentials", { email, password, redirectTo: "/admin" });
  return { success: true };
}

/** Public self-serve signup. Always creates a CUSTOMER — never an admin role. */
export async function registerCustomer(
  input: RegisterCustomerInput
): Promise<ActionResult> {
  const parsed = registerCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "An account with that email already exists." };
    }
    throw error;
  }

  await signIn("credentials", { email, password, redirectTo: "/" });
  return { success: true };
}

/** Shared login for admins and customers. Redirects to callbackUrl, or a role-based default. */
export async function loginAction(
  input: LoginInput,
  callbackUrl?: string
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { role: true },
  });
  const defaultTarget =
    existingUser?.role === "ADMIN" || existingUser?.role === "SUPER_ADMIN"
      ? "/admin"
      : existingUser?.role === "DELIVERY_RIDER"
        ? "/rider"
        : "/";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || defaultTarget,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password." };
    }
    throw error;
  }

  return { success: true };
}

/** Super Admin only: create a new Admin account. */
export async function createAdmin(input: CreateAdminInput): Promise<ActionResult> {
  await requireSuperAdmin();

  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, HASH_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "ADMIN",
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "An account with that email already exists." };
    }
    throw error;
  }

  return { success: true };
}

/** Super Admin only: deactivate an admin account (soft — preserves history). */
export async function setAdminActive(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireSuperAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "CUSTOMER") {
    return { success: false, error: "Admin account not found." };
  }
  if (target.role === "SUPER_ADMIN" && !isActive) {
    return { success: false, error: "Cannot deactivate a Super Admin account." };
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  return { success: true };
}

/** Admin or Super Admin: deactivate/reactivate a customer account (blocks login while inactive). */
export async function setCustomerActive(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role !== "CUSTOMER") {
    return { success: false, error: "Customer account not found." };
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  return { success: true };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
