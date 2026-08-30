import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { getSettings } from "@/lib/services/settings.service";
import {
  priceCartLines,
  computeOrderTotals,
  createPendingOrder,
  OrderPricingError,
} from "@/lib/services/order.service";
import { validateOfferCode } from "@/lib/services/offer.service";
import { createOrderInputSchema } from "@/lib/validations/order.schema";
import { getRazorpayClient, toPaise } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createOrderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const settings = await getSettings();
  if (input.orderType === "DELIVERY" && !settings.deliveryEnabled) {
    return NextResponse.json({ error: "Delivery is currently unavailable." }, { status: 400 });
  }
  if (input.orderType === "PICKUP" && !settings.pickupEnabled) {
    return NextResponse.json({ error: "Pickup is currently unavailable." }, { status: 400 });
  }
  if (input.paymentMethod === "COD" && !settings.codEnabled) {
    return NextResponse.json({ error: "Cash on delivery is currently unavailable." }, { status: 400 });
  }

  let pricedLines;
  try {
    pricedLines = await priceCartLines(input.lines);
  } catch (error) {
    if (error instanceof OrderPricingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  // Never trust a client-computed discount — re-validate the code fresh against the DB.
  let discountPercent = 0;
  if (input.couponCode) {
    const validation = await validateOfferCode(input.couponCode);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    discountPercent = validation.discountPercent;
  }

  const totals = computeOrderTotals(pricedLines, input.orderType, settings, discountPercent);

  const minOrder = settings.minOrderAmount ? Number(settings.minOrderAmount) : null;
  if (minOrder !== null && totals.subtotal < minOrder) {
    return NextResponse.json(
      { error: `Minimum order amount is ${minOrder}.` },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  const order = await createPendingOrder({
    input,
    userId: user?.id,
    pricedLines,
    totals,
  });

  // COD needs no payment gateway — the order is placed immediately (see order.service.ts),
  // cash is collected and marked paid by an admin later. Skip Razorpay entirely.
  if (input.paymentMethod === "COD") {
    return NextResponse.json({
      codOrder: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  }

  try {
    const razorpayOrder = await getRazorpayClient().orders.create({
      amount: toPaise(totals.totalAmount),
      currency: settings.currency,
      receipt: order.orderNumber,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_FAILED" },
    });
    console.error("Razorpay order creation failed", error);
    return NextResponse.json(
      { error: "Could not initiate payment. Please try again." },
      { status: 502 }
    );
  }
}
