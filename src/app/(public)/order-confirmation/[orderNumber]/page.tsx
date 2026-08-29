import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, Banknote } from "lucide-react";
import { getOrderByNumber } from "@/lib/services/order.service";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency, toNumber } from "@/lib/utils";

export const metadata = { title: "Order Confirmation" };

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

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([getOrderByNumber(orderNumber), getSettings()]);

  if (!order) notFound();

  // Confirmation is rendered ONLY from the database's order status — never from a client-side
  // callback alone (webhook + verify endpoint are the sources of truth for ONLINE payments).
  // COD orders skip the payment gate entirely (see order.service.ts) and only ever land in
  // PENDING_PAYMENT/PAYMENT_FAILED if something else went wrong, so this one check covers both
  // payment methods correctly.
  const isConfirmed = !["PENDING_PAYMENT", "PAYMENT_FAILED", "CANCELLED"].includes(order.status);
  const isCod = order.paymentMethod === "COD";

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      {isConfirmed ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
            Order Confirmed
          </h1>
          <p className="mt-2 text-sm text-muted">
            Thank you! Your order <span className="font-medium text-foreground">{order.orderNumber}</span>{" "}
            has been placed.
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {STATUS_LABELS[order.status] ?? order.status}
          </p>
          {isCod && order.paymentStatus !== "PAID" && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-foreground">
              <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
              Pay {formatCurrency(order.totalAmount, settings.currency)} in cash{" "}
              {order.orderType === "DELIVERY" ? "on delivery" : "at pickup"}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-danger" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
            {order.status === "CANCELLED" ? "Order Cancelled" : "Payment Not Completed"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Order <span className="font-medium text-foreground">{order.orderNumber}</span>{" "}
            {order.status === "CANCELLED"
              ? "was cancelled."
              : "was not paid. No charge was made. You can try again from your cart."}
          </p>
          <Link
            href="/cart"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Return to Cart
          </Link>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
        <div className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <div>
                <p className="text-foreground">
                  {item.quantity}× {item.itemNameSnapshot}
                  {item.variantNameSnapshot && ` (${item.variantNameSnapshot})`}
                </p>
              </div>
              <p className="text-muted">{formatCurrency(item.lineTotal, settings.currency)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal, settings.currency)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span>{formatCurrency(order.taxAmount, settings.currency)}</span>
          </div>
          {toNumber(order.deliveryFee) > 0 && (
            <div className="flex justify-between text-muted">
              <span>Delivery fee</span>
              <span>{formatCurrency(order.deliveryFee, settings.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount, settings.currency)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Payment method</span>
            <span>{isCod ? "Cash" : "Paid online"}</span>
          </div>
        </div>
      </div>

      {isConfirmed && (
        <div className="mt-6 text-center">
          <Link href="/track-order" className="text-sm font-medium text-primary underline">
            Track this order
          </Link>
        </div>
      )}
    </div>
  );
}
