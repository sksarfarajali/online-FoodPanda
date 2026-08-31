import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { toPaise, verifyRazorpaySignature } from "./razorpay";

describe("toPaise", () => {
  it("converts rupees to paise", () => {
    expect(toPaise(355)).toBe(35500);
  });

  it("rounds to avoid float drift", () => {
    expect(toPaise(19.99)).toBe(1999);
    expect(toPaise(0.1 + 0.2)).toBe(30);
  });
});

describe("verifyRazorpaySignature", () => {
  const secret = "test-webhook-secret";
  const orderId = "order_ABC123";
  const paymentId = "pay_XYZ789";

  function sign(oId: string, pId: string, key: string) {
    return crypto.createHmac("sha256", key).update(`${oId}|${pId}`).digest("hex");
  }

  it("accepts a signature computed with the correct secret", () => {
    const signature = sign(orderId, paymentId, secret);
    expect(verifyRazorpaySignature(orderId, paymentId, signature, secret)).toBe(true);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const signature = sign(orderId, paymentId, "wrong-secret");
    expect(verifyRazorpaySignature(orderId, paymentId, signature, secret)).toBe(false);
  });

  it("rejects a signature for a tampered order id", () => {
    const signature = sign(orderId, paymentId, secret);
    expect(verifyRazorpaySignature("order_TAMPERED", paymentId, signature, secret)).toBe(false);
  });

  it("rejects a signature for a tampered payment id", () => {
    const signature = sign(orderId, paymentId, secret);
    expect(verifyRazorpaySignature(orderId, "pay_TAMPERED", signature, secret)).toBe(false);
  });

  it("rejects a garbage/malformed signature without throwing", () => {
    expect(() => verifyRazorpaySignature(orderId, paymentId, "not-a-real-signature", secret)).not.toThrow();
    expect(verifyRazorpaySignature(orderId, paymentId, "not-a-real-signature", secret)).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifyRazorpaySignature(orderId, paymentId, "", secret)).toBe(false);
  });
});
