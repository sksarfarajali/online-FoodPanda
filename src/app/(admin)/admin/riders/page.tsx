import { prisma } from "@/lib/prisma";
import { RidersManager } from "@/components/admin/riders/riders-manager";

export const metadata = { title: "Riders" };

export default async function AdminRidersPage() {
  const riders = await prisma.user.findMany({
    where: { role: "DELIVERY_RIDER" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Riders</h1>
      <div className="mt-6">
        <RidersManager riders={riders} />
      </div>
    </div>
  );
}
