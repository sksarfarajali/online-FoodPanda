import { prisma } from "@/lib/prisma";
import { CustomersManager } from "@/components/admin/customers/customers-manager";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true, reservations: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Customers</h1>
      <p className="mt-1 text-sm text-muted">Every registered customer account.</p>
      <div className="mt-6">
        <CustomersManager customers={customers} />
      </div>
    </div>
  );
}
