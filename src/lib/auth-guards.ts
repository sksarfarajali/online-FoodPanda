import "server-only";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export class AuthorizationError extends Error {}

/** Returns the current session's user, or null if unauthenticated. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Throws unless the current user's role is one of `roles`.
 * This is the real security boundary for Server Actions — Proxy only
 * redirects for UX; it does not protect direct Server Function calls.
 */
export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    throw new AuthorizationError("Not authorized.");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN", "SUPER_ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"]);
}

/** Throws unless a user is authenticated (any role). */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthorizationError("Not authenticated.");
  }
  return user;
}
