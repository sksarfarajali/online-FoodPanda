import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings.service";
import { getOnDutyRiders } from "@/lib/services/rider.service";
import { formatCurrency, toNumber } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { MarkCashCollectedButton } from "@/components/admin/orders/mark-cash-collected-button";
import { AssignRiderForm } from "@/components/admin/orders/assign-rider-form";

export const metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings, riders] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true, user: true, rider: true } }),
    getSettings(),
    getOnDutyRiders(),
  ]);

  if (!order) notFound();

  const address = [order.deliveryAddressLine1, order.deliveryAddressLine2, order.deliveryCity, order.deliveryPostalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-muted">Placed {order.createdAt.toLocaleString()}</p>

      <div className="mt-6">
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      {order.orderType === "DELIVERY" && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">Rider</h2>
          <div className="mt-2">
            <AssignRiderForm orderId={order.id} currentRiderId={order.riderId} riders={riders} />
          </div>
          {order.rider && <p className="mt-1 text-xs text-muted">{order.rider.phone}</p>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Customer</h2>
          <dl className="mt-2 space-y-1 text-sm text-muted">
            <div>{order.customerName}</div>
            <div>{order.customerEmail}</div>
            <div>{order.customerPhone}</div>
            {order.user && <div className="text-xs">Registered account</div>}
          </dl>

          <h2 className="mt-4 text-sm font-semibold text-foreground">
            {order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}
          </h2>
          {order.orderType === "DELIVERY" && (
            <p className="mt-1 text-sm text-muted">{address || "No address provided"}</p>
          )}
          {order.deliveryInstructions && (
            <p className="mt-1 text-xs italic text-muted">{order.deliveryInstructions}</p>
          )}

          <h2 className="mt-4 text-sm font-semibold text-foreground">Payment</h2>
          <p className="mt-1 text-sm text-muted">
            {order.paymentMethod === "COD" ? "Cash" : "Online"} · {order.paymentStatus}{" "}
            {order.razorpayPaymentId && `· ${order.razorpayPaymentId}`}
          </p>
          {order.paymentMethod === "COD" && order.paymentStatus !== "PAID" && (
            <MarkCashCollectedButton orderId={order.id} />
          )}

          {order.deliveryProofUrl && (
            <>
              <h2 className="mt-4 text-sm font-semibold text-foreground">Handover Photo</h2>
              <div className="relative mt-2 h-40 w-full overflow-hidden rounded-[var(--radius)] border border-border">
                <Image src={order.deliveryProofUrl} alt="Delivery handover proof" fill className="object-cover" />
              </div>
              {order.deliveryProofAt && (
                <p className="mt-1 text-xs text-muted">Taken {order.deliveryProofAt.toLocaleString()}</p>
              )}
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Items</h2>
          <div className="mt-2 divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="py-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">
                    {item.quantity}× {item.itemNameSnapshot}
                    {item.variantNameSnapshot && ` (${item.variantNameSnapshot})`}
                  </span>
                  <span className="text-muted">{formatCurrency(item.lineTotal, settings.currency)}</span>
                </div>
                {Array.isArray(item.addonsSnapshot) && item.addonsSnapshot.length > 0 && (
                  <p className="text-xs text-muted">
                    + {(item.addonsSnapshot as { name: string }[]).map((a) => a.name).join(", ")}
                  </p>
                )}
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
            {toNumber(order.discountAmount) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>−{formatCurrency(order.discountAmount, settings.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
