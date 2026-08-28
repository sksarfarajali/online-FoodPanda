import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Orders" };

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

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{order.customerName}</td>
                <td className="px-4 py-3 text-muted">{order.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</td>
                <td className="px-4 py-3 text-muted">{STATUS_LABELS[order.status] ?? order.status}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.paymentStatus === "PAID"
                        ? "bg-success/15 text-success"
                        : order.paymentStatus === "FAILED"
                          ? "bg-danger/15 text-danger"
                          : "bg-muted/20 text-muted"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">{formatCurrency(order.totalAmount, settings.currency)}</td>
                <td className="px-4 py-3 text-muted">{order.createdAt.toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
