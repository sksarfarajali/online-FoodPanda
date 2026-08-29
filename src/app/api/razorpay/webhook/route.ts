import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { setOrderStatus } from "@/lib/services/order.service";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
      };
    };
  };
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !Razorpay.validateWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const razorpayOrderId = payload.payload.payment?.entity.order_id;
  const razorpayPaymentId = payload.payload.payment?.entity.id;
  if (!razorpayOrderId) {
    // Not a payment event we care about (e.g. refund/subscription) — acknowledge and ignore.
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order) {
    return NextResponse.json({ received: true });
  }

  if (payload.event === "payment.captured" && order.paymentStatus !== "PAID") {
    await setOrderStatus(order.id, "PLACED", {
      paymentStatus: "PAID",
      razorpayPaymentId: razorpayPaymentId ?? order.razorpayPaymentId ?? undefined,
    });
  } else if (payload.event === "payment.failed" && order.paymentStatus === "PENDING") {
    await setOrderStatus(order.id, "PAYMENT_FAILED", { paymentStatus: "FAILED" });
  }

  return NextResponse.json({ received: true });
}
