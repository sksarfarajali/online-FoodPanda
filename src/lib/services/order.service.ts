import { prisma } from "@/lib/prisma";
import { generateOrderNumber, toNumber } from "@/lib/utils";
import type { CreateOrderInput } from "@/lib/validations/order.schema";
import type { RestaurantSettingsModel } from "@/generated/prisma/models";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

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
  settings: RestaurantSettingsModel,
  discountPercent = 0
) {
  const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const taxAmount = Math.round(subtotal * (toNumber(settings.taxPercent) / 100) * 100) / 100;
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;

  let deliveryFee = 0;
  if (orderType === "DELIVERY") {
    const fee = toNumber(settings.deliveryFee);
    const freeAbove = settings.freeDeliveryAbove ? toNumber(settings.freeDeliveryAbove) : null;
    deliveryFee = freeAbove !== null && subtotal >= freeAbove ? 0 : fee;
  }

  const totalAmount = Math.round((subtotal + taxAmount + deliveryFee - discountAmount) * 100) / 100;

  return { subtotal, taxAmount, deliveryFee, discountAmount, totalAmount };
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

  // COD orders have no online payment step to wait for — the order is genuinely placed the
  // moment it's created. ONLINE orders stay PENDING_PAYMENT until Razorpay actually confirms
  // (via /api/razorpay/verify or the webhook) — never claim placed/paid before that happens.
  const isCod = input.paymentMethod === "COD";
  const initialStatus: OrderStatus = isCod ? "PLACED" : "PENDING_PAYMENT";

  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      orderType: input.orderType,
      paymentMethod: input.paymentMethod,
      deliveryAddressLine1: input.deliveryAddressLine1 || null,
      deliveryAddressLine2: input.deliveryAddressLine2 || null,
      deliveryCity: input.deliveryCity || null,
      deliveryPostalCode: input.deliveryPostalCode || null,
      deliveryInstructions: input.deliveryInstructions || null,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      deliveryFee: totals.deliveryFee,
      discountAmount: totals.discountAmount,
      couponCode: totals.discountAmount > 0 ? (input.couponCode?.trim() ?? null) : null,
      totalAmount: totals.totalAmount,
      status: initialStatus,
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
      statusHistory: {
        create: { status: initialStatus },
      },
    },
  });
}

/**
 * The one place an order's status is ever changed — always pairs the update with a
 * OrderStatusHistory row in the same transaction, so the timeline UI has an accurate
 * per-step timestamp instead of just the single, overwritten `updatedAt`.
 */
export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: Partial<{
    paymentStatus: PaymentStatus;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }>
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status, ...extra },
    });
    await tx.orderStatusHistory.create({ data: { orderId, status } });
    return order;
  });
}

/** Admin marks a COD order's cash as collected. Never applies to ONLINE orders — those are
 *  only ever marked PAID by Razorpay verification/webhook, never manually. */
export async function markCashCollected(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentMethod !== "COD") {
    throw new Error("Only Cash on Delivery orders can be marked as cash collected.");
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      rider: {
        select: {
          name: true,
          phone: true,
          currentLatitude: true,
          currentLongitude: true,
          locationUpdatedAt: true,
        },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}
