import Link from "next/link";

import { SectionHead } from "@/components/brand/section-head";
import { ReviewStars } from "@/components/reviews/stars";
import { formatReviewDate } from "@/lib/reviews/format";
import type { PublicReview } from "@/lib/reviews/read";

export function HomeQuotes({ reviews }: { reviews: PublicReview[] }) {
  const quotes = reviews.filter((review) => review.text.trim()).slice(0, 3);
  if (!quotes.length) return null;
  return (
    <section className="container-kg section-kg">
      <SectionHead
        title="Reviews"
        aside={
          <Link href="/reviews" className="no-underline hover:underline">
            Alle reviews
          </Link>
        }
      />
      <ul className="grid gap-12 lg:grid-cols-3 lg:gap-16">
        {quotes.map((review) => (
          <li key={review.id}>
            <p className="font-mono text-[13px] text-kg-text-2">
              {review.authorName}
              {formatReviewDate(review.createdAt) ? ` · ${formatReviewDate(review.createdAt)}` : ""}
            </p>
            <div className="mt-3">
              <ReviewStars rating={review.rating} />
            </div>
            <blockquote className="mt-4 text-[17px] leading-[1.65]">{review.text}</blockquote>
          </li>
        ))}
      </ul>
    </section>
  );
}