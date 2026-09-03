import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/enums";

// Orders that never became real (still awaiting payment) or didn't go through — excluded from
// every "orders placed" / "sales" figure below so an abandoned checkout doesn't inflate stats.
const REAL_ORDER_STATUSES: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export interface AdminDashboardStats {
  todayOrderCount: number;
  todaySalesTotal: number;
  statusBreakdown: { status: OrderStatus; count: number }[];
  riderStats: { id: string; name: string; isOnDuty: boolean; deliveredToday: number }[];
  topItemsToday: { name: string; quantitySold: number; revenue: number }[];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { start, end } = todayRange();

  const [salesAgg, statusGroups, riders, itemGroups] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: start, lt: end }, status: { in: REAL_ORDER_STATUSES } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start, lt: end } },
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: "DELIVERY_RIDER", isActive: true },
      select: {
        id: true,
        name: true,
        isOnDuty: true,
        _count: {
          select: {
            // Filtered on the COMPLETED entry in statusHistory, not order.updatedAt — the
            // latter can be bumped later by an unrelated change (e.g. cash marked collected
            // after delivery), which would misattribute the order to the wrong day.
            assignedOrders: {
              where: {
                status: "COMPLETED",
                statusHistory: { some: { status: "COMPLETED", createdAt: { gte: start, lt: end } } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.orderItem.groupBy({
      by: ["itemNameSnapshot"],
      where: { order: { createdAt: { gte: start, lt: end }, status: { in: REAL_ORDER_STATUSES } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  return {
    todayOrderCount: salesAgg._count._all,
    todaySalesTotal: toNumber(salesAgg._sum.totalAmount ?? 0),
    statusBreakdown: statusGroups
      .map((g) => ({ status: g.status, count: g._count._all }))
      .sort((a, b) => b.count - a.count),
    riderStats: riders.map((r) => ({
      id: r.id,
      name: r.name,
      isOnDuty: r.isOnDuty,
      deliveredToday: r._count.assignedOrders,
    })),
    topItemsToday: itemGroups.map((g) => ({
      name: g.itemNameSnapshot,
      quantitySold: g._sum.quantity ?? 0,
      revenue: toNumber(g._sum.lineTotal ?? 0),
    })),
  };
}

export interface RiderDashboardStats {
  deliveredToday: number;
  deliveredAllTime: number;
  cashCollectedAllTime: number;
  recentDeliveries: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    deliveredAt: Date;
  }[];
}

export async function getRiderDashboardStats(riderId: string): Promise<RiderDashboardStats> {
  const { start, end } = todayRange();

  const [deliveredToday, deliveredAllTime, cashAgg, recent] = await Promise.all([
    prisma.order.count({
      where: {
        riderId,
        status: "COMPLETED",
        statusHistory: { some: { status: "COMPLETED", createdAt: { gte: start, lt: end } } },
      },
    }),
    prisma.order.count({ where: { riderId, status: "COMPLETED" } }),
    prisma.order.aggregate({
      where: { riderId, status: "COMPLETED", paymentMethod: "COD", paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { riderId, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        paymentMethod: true,
        updatedAt: true,
        statusHistory: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
  ]);

  return {
    deliveredToday,
    deliveredAllTime,
    cashCollectedAllTime: toNumber(cashAgg._sum.totalAmount ?? 0),
    recentDeliveries: recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: toNumber(o.totalAmount),
      paymentMethod: o.paymentMethod,
      deliveredAt: o.statusHistory[0]?.createdAt ?? o.updatedAt,
    })),
  };
}
