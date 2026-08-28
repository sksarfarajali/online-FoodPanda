import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartLine {
  /** Deterministic key derived from menuItemId+variantId+addonIds, used to merge duplicate adds. */
  key: string;
  menuItemId: string;
  name: string;
  imageUrl?: string | null;
  variantId?: string;
  variantName?: string;
  addons: CartAddon[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
}

export function buildCartKey(menuItemId: string, variantId?: string, addonIds?: string[]) {
  const sortedAddons = [...(addonIds ?? [])].sort().join(",");
  return `${menuItemId}::${variantId ?? ""}::${sortedAddons}`;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "key">) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (line) =>
        set((state) => {
          const key = buildCartKey(
            line.menuItemId,
            line.variantId,
            line.addons.map((a) => a.id)
          );
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, key }] };
        }),
      removeLine: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "swaad-e-mehfil-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function cartTotalItems(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce(
    (sum, l) => sum + (l.unitPrice + l.addons.reduce((a, addon) => a + addon.price, 0)) * l.quantity,
    0
  );
}
