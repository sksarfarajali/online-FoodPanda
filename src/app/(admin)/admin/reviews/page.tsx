import { prisma } from "@/lib/prisma";
import { ReviewsManager } from "@/components/admin/reviews/reviews-manager";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Reviews</h1>
      <div className="mt-6">
        <ReviewsManager reviews={reviews} />
      </div>
    </div>
  );
}
