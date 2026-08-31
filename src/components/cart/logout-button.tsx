"use client";

import { useCartStore } from "@/stores/cart.store";

export function LogoutButton() {
  return (
    <button
      type="submit"
      onClick={() => useCartStore.getState().clear()}
      className="w-full rounded-[var(--radius)] px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-surface"
    >
      Log out
    </button>
  );
}
