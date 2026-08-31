import Razorpay from "razorpay";
import crypto from "crypto";

let client: Razorpay | null = null;

/** Lazily constructed so builds/dev without Razorpay keys configured don't crash at import time. */
export function getRazorpayClient() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env."
      );
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

/** Convert a rupee amount to paise (Razorpay's smallest-unit convention), rounding to avoid float drift. */
export function toPaise(amount: number) {
  return Math.round(amount * 100);
}

/** Verifies a Razorpay Checkout.js payment signature (order_id|payment_id HMAC-SHA256). */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  secret: string
) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return (
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  );
}
