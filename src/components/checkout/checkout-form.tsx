"use client";

import { useState, useTransition } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils";
import { checkPromoCode } from "@/lib/actions/offer.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export interface CheckoutDefaults {
  name?: string;
  email?: string;
  phone?: string;
}

export function CheckoutForm({
  currency,
  deliveryEnabled,
  pickupEnabled,
  codEnabled,
  defaults,
}: {
  currency: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  codEnabled: boolean;
  defaults: CheckoutDefaults;
}) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = cartSubtotal(lines);

  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">(
    deliveryEnabled ? "DELIVERY" : "PICKUP"
  );
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [name, setName] = useState(defaults.name ?? "");
  const [email, setEmail] = useState(defaults.email ?? "");
  const [phone, setPhone] = useState(defaults.phone ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [scriptStatus, setScriptStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    title: string;
    discountPercent: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, startApplyingPromo] = useTransition();

  const needsRazorpay = paymentMethod === "ONLINE";
  const discountPreview = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;

  function handleApplyPromo() {
    setPromoError(null);
    startApplyingPromo(async () => {
      const result = await checkPromoCode(promoCode);
      if (!result.valid) {
        setAppliedPromo(null);
        setPromoError(result.error);
        return;
      }
      setAppliedPromo({
        code: result.code,
        title: result.title,
        discountPercent: result.discountPercent,
      });
    });
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            menuItemId: l.menuItemId,
            variantId: l.variantId,
            addonIds: l.addons.map((a) => a.id),
            quantity: l.quantity,
            specialInstructions: l.specialInstructions,
          })),
          orderType,
          paymentMethod,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryAddressLine1: orderType === "DELIVERY" ? addressLine1 : undefined,
          deliveryAddressLine2: orderType === "DELIVERY" ? addressLine2 : undefined,
          deliveryCity: orderType === "DELIVERY" ? city : undefined,
          deliveryPostalCode: orderType === "DELIVERY" ? postalCode : undefined,
          deliveryInstructions: orderType === "DELIVERY" ? deliveryInstructions : undefined,
          couponCode: appliedPromo?.code,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Cash on Delivery/Pickup — no payment gateway involved, the order is placed immediately.
      if (data.codOrder) {
        clearCart();
        router.push(`/order-confirmation/${data.orderNumber}`);
        return;
      }

      if (scriptStatus !== "ready" || typeof window.Razorpay === "undefined") {
        setError(
          "Payment could not start — the payment gateway hasn't finished loading yet. Please wait a moment and try again."
        );
        setIsSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Swaad-e-Mehfil",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name, email, contact: phone },
        handler: async (result: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...result }),
          });
          if (verifyRes.ok) {
            clearCart();
          }
          router.push(`/order-confirmation/${data.orderNumber}`);
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            router.push(`/order-confirmation/${data.orderNumber}`);
          },
        },
        theme: { color: "#7a2e2e" },
      });
      razorpay.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return <p className="text-sm text-muted">Your cart is empty.</p>;
  }

  const codLabel = orderType === "DELIVERY" ? "Cash on Delivery" : "Pay at Pickup";

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptStatus("ready")}
        onError={() => setScriptStatus("error")}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {deliveryEnabled && pickupEnabled && (
          <div className="flex gap-2">
            {(["DELIVERY", "PICKUP"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                aria-pressed={orderType === type}
                className={`h-10 flex-1 rounded-[var(--radius)] border text-sm font-medium ${
                  orderType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                {type === "DELIVERY" ? "Delivery" : "Pickup"}
              </button>
            ))}
          </div>
        )}

        {codEnabled && (
          <div>
            <Label>Payment method</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: "ONLINE" as const, label: "Pay Online" },
                  { value: "COD" as const, label: codLabel },
                ]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  aria-pressed={paymentMethod === option.value}
                  className={`h-10 flex-1 rounded-[var(--radius)] border text-sm font-medium ${
                    paymentMethod === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {orderType === "DELIVERY" && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="addressLine2">Apartment, suite, etc. (optional)</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deliveryInstructions">Delivery instructions (optional)</Label>
              <Textarea
                id="deliveryInstructions"
                rows={2}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <Label htmlFor="promoCode">Promo code</Label>
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-[var(--radius)] border border-success/40 bg-success/10 px-3.5 py-2.5 text-sm">
              <span className="text-foreground">
                <span className="font-semibold">{appliedPromo.code}</span> applied —{" "}
                {appliedPromo.discountPercent}% off
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-xs font-medium text-primary underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="uppercase"
              />
              <Button
                type="button"
                variant="secondary"
                isLoading={isApplyingPromo}
                disabled={!promoCode.trim()}
                onClick={handleApplyPromo}
              >
                Apply
              </Button>
            </div>
          )}
          {promoError && <p className="mt-1.5 text-sm text-danger">{promoError}</p>}
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal, currency)}</span>
          </div>
          {appliedPromo && (
            <div className="flex items-center justify-between text-success">
              <span>Discount ({appliedPromo.discountPercent}%)</span>
              <span>−{formatCurrency(discountPreview, currency)}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted">
          {paymentMethod === "COD"
            ? "Taxes and delivery fee are calculated on the next step. Pay in cash when your order arrives."
            : "Taxes and delivery fee are calculated on the next step."}
        </p>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {needsRazorpay && scriptStatus === "error" && (
          <p role="alert" className="text-sm text-danger">
            Couldn&apos;t load the payment gateway. Check your connection (or an ad-blocker
            blocking checkout.razorpay.com) and refresh the page.
          </p>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting || (needsRazorpay && scriptStatus === "loading")}
          disabled={needsRazorpay && scriptStatus !== "ready"}
          className="w-full"
        >
          {needsRazorpay
            ? scriptStatus === "loading"
              ? "Preparing secure payment…"
              : "Pay & Place Order"
            : `Place Order (${codLabel})`}
        </Button>
      </form>
    </>
  );
}
