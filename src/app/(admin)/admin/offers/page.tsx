import { prisma } from "@/lib/prisma";
import { OffersManager } from "@/components/admin/offers/offers-manager";
import { toNumber } from "@/lib/utils";

export const metadata = { title: "Offers" };

export default async function AdminOffersPage() {
  const offers = await prisma.offer.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Offers</h1>
      <div className="mt-6">
        <OffersManager
          offers={offers.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            code: o.code,
            discountPercent: o.discountPercent ? toNumber(o.discountPercent) : null,
            startsAt: o.startsAt ? o.startsAt.toISOString().slice(0, 10) : null,
            endsAt: o.endsAt ? o.endsAt.toISOString().slice(0, 10) : null,
            isActive: o.isActive,
          }))}
        />
      </div>
    </div>
  );
}
