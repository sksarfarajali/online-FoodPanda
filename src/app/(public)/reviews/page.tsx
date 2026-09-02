import { getApprovedReviews, getAverageRating } from "@/lib/services/review.service";
import { getSettings } from "@/lib/services/settings.service";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ReviewCard } from "@/components/shared/review-card";
import { StarRating } from "@/components/shared/star-rating";
import { ReviewSubmitForm } from "@/components/review/review-submit-form";
import { buildBaseMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildBaseMetadata(settings, { title: "Reviews", path: "/reviews" });
}

export default async function ReviewsPage() {
  const [reviews, { average, count }, user] = await Promise.all([
    getApprovedReviews(),
    getAverageRating(),
    getCurrentUser(),
  ]);
  const myReview = user
    ? await prisma.review.findUnique({
        where: { userId: user.id },
        select: { rating: true, comment: true, isApproved: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Guest Reviews</h1>
      {average !== null && count > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={Math.round(average)} />
          <span className="text-sm text-muted">
            {average.toFixed(1)} out of 5 ({count} review{count === 1 ? "" : "s"})
          </span>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              authorName={review.authorName}
              rating={review.rating}
              comment={review.comment}
              source={review.source}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">
          No reviews yet — be among the first to visit and share your experience.
        </p>
      )}

      <div className="mt-12 max-w-xl">
        <ReviewSubmitForm isLoggedIn={!!user} myReview={myReview} />
      </div>
    </div>
  );
}
