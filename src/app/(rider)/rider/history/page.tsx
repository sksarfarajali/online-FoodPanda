import { getCurrentUser } from "@/lib/auth-guards";
import { getRiderDashboardStats } from "@/lib/services/dashboard.service";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "My Dashboard" };

export default async function RiderHistoryPage() {
  const user = await getCurrentUser();
  const [stats, settings] = await Promise.all([
    getRiderDashboardStats(user!.id),
    getSettings(),
  ]);

  const cards = [
    { label: "Delivered today", value: stats.deliveredToday },
    { label: "Delivered all time", value: stats.deliveredAllTime },
    { label: "Cash collected (all time)", value: formatCurrency(stats.cashCollectedAllTime, settings.currency) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">My Dashboard</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Recent Deliveries</h2>
        {stats.recentDeliveries.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No deliveries yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {stats.recentDeliveries.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-sm text-muted">{formatCurrency(order.totalAmount, settings.currency)}</p>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-xs text-muted">
                  <span>{order.customerName}</span>
                  <span>
                    {order.paymentMethod === "COD" ? "Cash" : "Online"} ·{" "}
                    {order.deliveredAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
