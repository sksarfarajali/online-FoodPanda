import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [pendingReservations, newMessages, pendingOrders] = await Promise.all([
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: { in: ["PLACED", "CONFIRMED", "PREPARING"] } } }),
  ]);

  const stats = [
    { label: "Pending reservations", value: pendingReservations },
    { label: "Active orders", value: pendingOrders },
    { label: "New messages", value: newMessages },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
