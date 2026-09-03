import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getActiveOrdersForRider } from "@/lib/services/rider.service";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";
import { OnDutyToggle } from "@/components/rider/on-duty-toggle";
import { PushNotificationToggle } from "@/components/shared/push-notification-toggle";

export const metadata = { title: "My Deliveries" };

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Assigned",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
};

export default async function RiderDashboardPage() {
  const sessionUser = await getCurrentUser();
  // Session/JWT data is stale by design — read the live isOnDuty flag straight from the DB.
  const [riderRecord, orders, settings] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser!.id }, select: { isOnDuty: true } }),
    getActiveOrdersForRider(sessionUser!.id),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">My Deliveries</h1>

      <div className="flex flex-wrap items-center gap-3">
        <OnDutyToggle isOnDuty={riderRecord.isOnDuty} />
        <PushNotificationToggle label="New delivery alerts" />
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No deliveries assigned right now.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/rider/orders/${order.id}`}
              className="block rounded-lg border border-border bg-surface p-4 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                <p className="text-sm text-muted">{formatCurrency(order.totalAmount, settings.currency)}</p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {order.deliveryAddressLine1}, {order.deliveryCity}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {STATUS_LABELS[order.status] ?? order.status}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
