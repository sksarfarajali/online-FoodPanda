import { describe, it, expect } from "vitest";
import { buildCartKey, cartTotalItems, cartSubtotal, type CartLine } from "./cart.store";

describe("buildCartKey", () => {
  it("is stable for the same menu item, variant, and addons", () => {
    const key1 = buildCartKey("item-1", "variant-1", ["addon-b", "addon-a"]);
    const key2 = buildCartKey("item-1", "variant-1", ["addon-a", "addon-b"]);
    expect(key1).toBe(key2);
  });

  it("differs when the variant differs", () => {
    const key1 = buildCartKey("item-1", "variant-1");
    const key2 = buildCartKey("item-1", "variant-2");
    expect(key1).not.toBe(key2);
  });

  it("differs when the addon set differs", () => {
    const key1 = buildCartKey("item-1", undefined, ["addon-a"]);
    const key2 = buildCartKey("item-1", undefined, ["addon-a", "addon-b"]);
    expect(key1).not.toBe(key2);
  });
});

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    key: "item-1::::",
    menuItemId: "item-1",
    name: "Butter Chicken",
    addons: [],
    unitPrice: 280,
    quantity: 1,
    ...overrides,
  };
}

describe("cartTotalItems", () => {
  it("sums quantities across lines", () => {
    const lines = [makeLine({ quantity: 2 }), makeLine({ key: "item-2", quantity: 3 })];
    expect(cartTotalItems(lines)).toBe(5);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartTotalItems([])).toBe(0);
  });
});

describe("cartSubtotal", () => {
  it("multiplies unit price by quantity", () => {
    const lines = [makeLine({ unitPrice: 200, quantity: 3 })];
    expect(cartSubtotal(lines)).toBe(600);
  });

  it("includes addon prices in the per-unit total before multiplying by quantity", () => {
    const lines = [
      makeLine({
        unitPrice: 200,
        quantity: 2,
        addons: [
          { id: "a1", name: "Extra Cheese", price: 30 },
          { id: "a2", name: "Extra Spicy", price: 10 },
        ],
      }),
    ];
    // (200 + 30 + 10) * 2 = 480
    expect(cartSubtotal(lines)).toBe(480);
  });

  it("sums across multiple lines", () => {
    const lines = [
      makeLine({ key: "a", unitPrice: 100, quantity: 1 }),
      makeLine({ key: "b", unitPrice: 250, quantity: 2 }),
    ];
    expect(cartSubtotal(lines)).toBe(600);
  });
});
