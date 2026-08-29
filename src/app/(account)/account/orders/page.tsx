import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-guards";
import { getOrdersForUser } from "@/lib/services/order.service";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "My Orders" };

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

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  const [orders, settings] = await Promise.all([
    user ? getOrdersForUser(user.id) : Promise.resolve([]),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">My Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order-confirmation/${order.orderNumber}`}
              className="block rounded-lg border border-border bg-surface p-4 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                <p className="text-sm text-muted">{formatCurrency(order.totalAmount, settings.currency)}</p>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted">
                <span>
                  {STATUS_LABELS[order.status] ?? order.status}
                  {" · "}
                  {order.paymentMethod === "COD" ? "Cash" : "Online"}
                </span>
                <span>{order.createdAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
