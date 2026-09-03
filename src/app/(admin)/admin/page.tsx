import { prisma } from "@/lib/prisma";
import { getAdminDashboardStats } from "@/lib/services/dashboard.service";
import { getSettings } from "@/lib/services/settings.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Admin overview" };

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

export default async function AdminOverviewPage() {
  const [pendingReservations, newMessages, activeOrders, dashboard, settings] = await Promise.all([
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: { in: ["PLACED", "CONFIRMED", "PREPARING"] } } }),
    getAdminDashboardStats(),
    getSettings(),
  ]);

  const quickStats = [
    { label: "Pending reservations", value: pendingReservations },
    { label: "Active orders", value: activeOrders },
    { label: "New messages", value: newMessages },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-surface p-5">
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">Today</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-muted">Orders placed today</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{dashboard.todayOrderCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-muted">Sales value today</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {formatCurrency(dashboard.todaySalesTotal, settings.currency)}
            </p>
          </div>
        </div>

        {dashboard.statusBreakdown.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-medium text-foreground">Status breakdown (today)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboard.statusBreakdown.map((entry) => (
                <span
                  key={entry.status}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                >
                  {STATUS_LABELS[entry.status] ?? entry.status}: {entry.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">Rider Performance (Today)</h2>
        {dashboard.riderStats.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No active riders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Rider</th>
                  <th className="px-4 py-3 font-medium">On duty</th>
                  <th className="px-4 py-3 font-medium">Delivered today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dashboard.riderStats.map((rider) => (
                  <tr key={rider.id}>
                    <td className="px-4 py-3 text-foreground">{rider.name}</td>
                    <td className="px-4 py-3 text-muted">{rider.isOnDuty ? "On duty" : "Off duty"}</td>
                    <td className="px-4 py-3 text-foreground">{rider.deliveredToday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">Top Items Sold (Today)</h2>
        {dashboard.topItemsToday.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No items sold yet today.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Quantity sold</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dashboard.topItemsToday.map((item) => (
                  <tr key={item.name}>
                    <td className="px-4 py-3 text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-foreground">{item.quantitySold}</td>
                    <td className="px-4 py-3 text-muted">{formatCurrency(item.revenue, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
