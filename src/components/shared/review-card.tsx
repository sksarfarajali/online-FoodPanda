import { StarRating } from "./star-rating";

export function ReviewCard({
  authorName,
  rating,
  comment,
  source,
}: {
  authorName: string;
  rating: number;
  comment?: string | null;
  source?: string | null;
}) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-surface p-5">
      <StarRating rating={rating} />
      {comment && <blockquote className="mt-3 flex-1 text-sm text-foreground">“{comment}”</blockquote>}
      <figcaption className="mt-4 text-sm font-medium text-foreground">
        {authorName}
        {source && <span className="ml-1.5 font-normal text-muted">via {source}</span>}
      </figcaption>
    </figure>
  );
}
