import { prisma } from "@/lib/prisma";
import { generateOrderNumber, toNumber } from "@/lib/utils";
import type { CreateOrderInput } from "@/lib/validations/order.schema";
import type { RestaurantSettingsModel } from "@/generated/prisma/models";

export class OrderPricingError extends Error {}

interface PricedLine {
  menuItemId: string;
  itemNameSnapshot: string;
  variantId?: string;
  variantNameSnapshot?: string;
  unitPriceSnapshot: number;
  quantity: number;
  addonsSnapshot: { id: string; name: string; price: number }[];
  lineTotal: number;
}

/**
 * Recomputes pricing entirely from the database. Client-submitted prices are never trusted —
 * only menuItemId/variantId/addonIds/quantity are read from the request.
 */
export async function priceCartLines(lines: CreateOrderInput["lines"]) {
  const menuItemIds = [...new Set(lines.map((l) => l.menuItemId))];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { variants: true, addons: true },
  });
  const menuItemById = new Map(menuItems.map((item) => [item.id, item]));

  const pricedLines: PricedLine[] = [];
  const unavailable: string[] = [];

  for (const line of lines) {
    const menuItem = menuItemById.get(line.menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      unavailable.push(menuItem?.name ?? "An item in your cart");
      continue;
    }

    let unitPrice = toNumber(menuItem.basePrice);
    let variantName: string | undefined;
    if (line.variantId) {
      const variant = menuItem.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        unavailable.push(menuItem.name);
        continue;
      }
      unitPrice += toNumber(variant.priceDelta);
      variantName = variant.name;
    }

    const addonsSnapshot: { id: string; name: string; price: number }[] = [];
    let hasUnavailableAddon = false;
    for (const addonId of line.addonIds) {
      const addon = menuItem.addons.find((a) => a.id === addonId);
      if (!addon || !addon.isAvailable) {
        hasUnavailableAddon = true;
        break;
      }
      addonsSnapshot.push({ id: addon.id, name: addon.name, price: toNumber(addon.price) });
    }
    if (hasUnavailableAddon) {
      unavailable.push(menuItem.name);
      continue;
    }

    const addonsTotal = addonsSnapshot.reduce((sum, a) => sum + a.price, 0);
    const lineTotal = (unitPrice + addonsTotal) * line.quantity;

    pricedLines.push({
      menuItemId: menuItem.id,
      itemNameSnapshot: menuItem.name,
      variantId: line.variantId,
      variantNameSnapshot: variantName,
      unitPriceSnapshot: unitPrice,
      quantity: line.quantity,
      addonsSnapshot,
      lineTotal,
    });
  }

  if (unavailable.length > 0) {
    throw new OrderPricingError(
      `Some items are no longer available: ${[...new Set(unavailable)].join(", ")}. Please update your cart.`
    );
  }

  return pricedLines;
}

export function computeOrderTotals(
  pricedLines: PricedLine[],
  orderType: "DELIVERY" | "PICKUP",
  settings: RestaurantSettingsModel
) {
  const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const taxAmount = Math.round(subtotal * (toNumber(settings.taxPercent) / 100) * 100) / 100;

  let deliveryFee = 0;
  if (orderType === "DELIVERY") {
    const fee = toNumber(settings.deliveryFee);
    const freeAbove = settings.freeDeliveryAbove ? toNumber(settings.freeDeliveryAbove) : null;
    deliveryFee = freeAbove !== null && subtotal >= freeAbove ? 0 : fee;
  }

  const totalAmount = Math.round((subtotal + taxAmount + deliveryFee) * 100) / 100;

  return { subtotal, taxAmount, deliveryFee, discountAmount: 0, totalAmount };
}

async function generateUniqueOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateOrderNumber();
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique order number. Please try again.");
}

export async function createPendingOrder(params: {
  input: CreateOrderInput;
  userId?: string;
  pricedLines: PricedLine[];
  totals: ReturnType<typeof computeOrderTotals>;
}) {
  const { input, userId, pricedLines, totals } = params;
  const orderNumber = await generateUniqueOrderNumber();

  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      orderType: input.orderType,
      deliveryAddressLine1: input.deliveryAddressLine1 || null,
      deliveryAddressLine2: input.deliveryAddressLine2 || null,
      deliveryCity: input.deliveryCity || null,
      deliveryPostalCode: input.deliveryPostalCode || null,
      deliveryInstructions: input.deliveryInstructions || null,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      deliveryFee: totals.deliveryFee,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      items: {
        create: pricedLines.map((line) => ({
          menuItemId: line.menuItemId,
          itemNameSnapshot: line.itemNameSnapshot,
          variantNameSnapshot: line.variantNameSnapshot,
          unitPriceSnapshot: line.unitPriceSnapshot,
          quantity: line.quantity,
          addonsSnapshot: line.addonsSnapshot,
          lineTotal: line.lineTotal,
        })),
      },
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}
