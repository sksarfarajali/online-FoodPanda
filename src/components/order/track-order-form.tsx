"use client";

import { useState, useTransition } from "react";
import { lookupOrder, type OrderLookupResult } from "@/lib/actions/order.actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { OrderTrackingMap } from "@/components/order/order-tracking-map";
import { OrderStatusTimeline } from "@/components/order/order-status-timeline";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  PAYMENT_FAILED: "Payment failed",
};

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    startTransition(async () => {
      const res = await lookupOrder(orderNumber, contact);
      setResult(res);
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Track Your Order</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order number and the phone or email you used to order.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="SEM-20260101-ABC123"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact">Phone or email</Label>
          <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
        </div>
        <Button type="submit" isLoading={isPending} className="w-full">
          Track Order
        </Button>
      </form>

      {searched && !isPending && (
        <div className="mt-8">
          {result?.found ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-sm text-muted">Order {result.orderNumber}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {STATUS_LABELS[result.status] ?? result.status}
                </p>
                <dl className="mt-3 space-y-1 text-sm text-muted">
                  <div className="flex justify-between">
                    <dt>Type</dt>
                    <dd>{result.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Total</dt>
                    <dd>{formatCurrency(result.totalAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Payment</dt>
                    <dd>
                      {result.paymentMethod === "COD"
                        ? result.paymentStatus === "PAID"
                          ? "Cash — collected"
                          : "Cash — pay on " + (result.orderType === "DELIVERY" ? "delivery" : "pickup")
                        : result.paymentStatus === "PAID"
                          ? "Paid online"
                          : "Payment pending"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Placed</dt>
                    <dd>{new Date(result.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              {!["PENDING_PAYMENT", "PAYMENT_FAILED", "CANCELLED"].includes(result.status) && (
                <OrderStatusTimeline
                  orderType={result.orderType}
                  status={result.status}
                  statusHistory={result.statusHistory}
                />
              )}

              {result.orderType === "DELIVERY" && (
                <OrderTrackingMap
                  orderNumber={result.orderNumber}
                  initialStatus={result.status}
                  initialRider={result.rider}
                  poll={async () => {
                    const res = await lookupOrder(orderNumber, contact);
                    return res.found ? { status: res.status, rider: res.rider } : null;
                  }}
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-danger">
              We couldn&apos;t find a matching order. Please check the details and try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
