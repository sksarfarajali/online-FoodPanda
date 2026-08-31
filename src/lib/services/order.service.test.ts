import { describe, it, expect } from "vitest";
import { computeOrderTotals } from "./order.service";
import type { RestaurantSettingsModel } from "@/generated/prisma/models";

type ComputeOrderTotalsArgs = Parameters<typeof computeOrderTotals>;
type PricedLine = ComputeOrderTotalsArgs[0][number];

function line(lineTotal: number): PricedLine {
  return { lineTotal } as PricedLine;
}

interface SettingsOverrides {
  taxPercent?: number;
  deliveryFee?: number;
  freeDeliveryAbove?: number | null;
}

function settings(overrides: SettingsOverrides = {}): RestaurantSettingsModel {
  return {
    taxPercent: 5,
    deliveryFee: 40,
    freeDeliveryAbove: 500,
    ...overrides,
  } as unknown as RestaurantSettingsModel;
}

describe("computeOrderTotals", () => {
  it("charges the delivery fee below the free-delivery threshold", () => {
    const totals = computeOrderTotals([line(300)], "DELIVERY", settings());
    expect(totals.subtotal).toBe(300);
    expect(totals.deliveryFee).toBe(40);
    expect(totals.taxAmount).toBe(15); // 5% of 300
    expect(totals.totalAmount).toBe(355); // 300 + 15 + 40
  });

  it("waives the delivery fee at or above the free-delivery threshold", () => {
    const totals = computeOrderTotals([line(500)], "DELIVERY", settings());
    expect(totals.deliveryFee).toBe(0);
    expect(totals.totalAmount).toBe(525); // 500 + 25 tax + 0 delivery
  });

  it("never charges a delivery fee for pickup orders", () => {
    const totals = computeOrderTotals([line(100)], "PICKUP", settings());
    expect(totals.deliveryFee).toBe(0);
  });

  it("applies a discount percentage against the subtotal", () => {
    const totals = computeOrderTotals([line(1000)], "PICKUP", settings(), 10);
    expect(totals.discountAmount).toBe(100);
    expect(totals.totalAmount).toBe(950); // 1000 + 50 tax - 100 discount
  });

  it("rounds monetary values to 2 decimal places", () => {
    const totals = computeOrderTotals([line(99.99)], "PICKUP", settings({ taxPercent: 5.5 }), 0);
    expect(totals.taxAmount).toBeCloseTo(5.5, 2);
    expect(Number.isInteger(totals.taxAmount * 100)).toBe(true);
  });

  it("sums multiple priced lines into the subtotal", () => {
    const totals = computeOrderTotals([line(200), line(150), line(50)], "PICKUP", settings());
    expect(totals.subtotal).toBe(400);
  });

  it("treats a delivery fee as unconditional when no free-delivery threshold is configured", () => {
    const totals = computeOrderTotals(
      [line(10000)],
      "DELIVERY",
      settings({ freeDeliveryAbove: null })
    );
    expect(totals.deliveryFee).toBe(40);
  });
});
