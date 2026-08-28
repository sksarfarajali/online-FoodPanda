import { prisma } from "@/lib/prisma";

export async function getApprovedReviews(limit?: number) {
  return prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAverageRating() {
  const result = await prisma.review.aggregate({
    where: { isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: result._avg.rating, count: result._count.rating };
}
