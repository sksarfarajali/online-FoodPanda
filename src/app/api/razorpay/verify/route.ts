import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setOrderStatus } from "@/lib/services/order.service";
import { verifyPaymentInputSchema } from "@/lib/validations/order.schema";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = verifyPaymentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Payment verification unavailable." }, { status: 500 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    secret
  );

  if (!isValid) {
    await setOrderStatus(order.id, "PAYMENT_FAILED", { paymentStatus: "FAILED" });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  // Idempotent: only transition if not already confirmed (webhook may have won the race).
  if (order.paymentStatus !== "PAID") {
    await setOrderStatus(order.id, "PLACED", {
      paymentStatus: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
  }

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
