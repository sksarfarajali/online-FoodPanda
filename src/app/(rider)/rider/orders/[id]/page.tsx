import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";
import { RiderOrderStatusButtons } from "@/components/rider/rider-order-status-buttons";
import { LocationTracker } from "@/components/rider/location-tracker";

export const metadata = { title: "Delivery Detail" };

export default async function RiderOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ]);

  if (!order) notFound();
  // Ownership check — a rider only ever sees orders assigned to them, mirroring the same
  // check enforced server-side in updateOrderStatusAsRider.
  if (order.riderId !== user!.id) redirect("/rider");

  const address = [order.deliveryAddressLine1, order.deliveryAddressLine2, order.deliveryCity, order.deliveryPostalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Order {order.orderNumber}</h1>
        <p className="mt-1 text-sm text-muted">{formatCurrency(order.totalAmount, settings.currency)}</p>
      </div>

      <RiderOrderStatusButtons orderId={order.id} status={order.status} />

      {order.status === "OUT_FOR_DELIVERY" && <LocationTracker />}

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Customer</h2>
        <dl className="mt-2 space-y-1 text-sm text-muted">
          <div>{order.customerName}</div>
          <div>
            <a href={`tel:${order.customerPhone}`} className="text-primary underline">
              {order.customerPhone}
            </a>
          </div>
          <div>{address || "No address provided"}</div>
          {order.deliveryInstructions && <div className="italic">{order.deliveryInstructions}</div>}
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Payment</h2>
        <p className="mt-1 text-sm text-muted">
          {order.paymentMethod === "COD"
            ? `Collect ${formatCurrency(order.totalAmount, settings.currency)} in cash`
            : "Paid online"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Items</h2>
        <div className="mt-2 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-foreground">
                {item.quantity}× {item.itemNameSnapshot}
                {item.variantNameSnapshot && ` (${item.variantNameSnapshot})`}
              </span>
              <span className="text-muted">{formatCurrency(item.lineTotal, settings.currency)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
