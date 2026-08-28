"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils";
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
  defaults,
}: {
  currency: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  defaults: CheckoutDefaults;
}) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = cartSubtotal(lines);

  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">(
    deliveryEnabled ? "DELIVERY" : "PICKUP"
  );
  const [name, setName] = useState(defaults.name ?? "");
  const [email, setEmail] = useState(defaults.email ?? "");
  const [phone, setPhone] = useState(defaults.phone ?? "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [scriptReady, setScriptReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryAddressLine1: orderType === "DELIVERY" ? addressLine1 : undefined,
          deliveryAddressLine2: orderType === "DELIVERY" ? addressLine2 : undefined,
          deliveryCity: orderType === "DELIVERY" ? city : undefined,
          deliveryPostalCode: orderType === "DELIVERY" ? postalCode : undefined,
          deliveryInstructions: orderType === "DELIVERY" ? deliveryInstructions : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!scriptReady || typeof window.Razorpay === "undefined") {
        setError("Payment could not start. Please refresh and try again.");
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

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
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

        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-foreground">{formatCurrency(subtotal, currency)}</span>
        </div>
        <p className="text-xs text-muted">Taxes and delivery fee are calculated on the next step.</p>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Pay & Place Order
        </Button>
      </form>
    </>
  );
}
