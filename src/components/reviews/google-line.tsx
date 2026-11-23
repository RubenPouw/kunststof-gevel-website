import Link from "next/link";
import type { ReactNode } from "react";

import { ReviewStars } from "@/components/reviews/stars";
import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";
import { googleReviewHref, googleReviewScoreText } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";

export function GoogleReviewsLink({
  className,
  children,
  label,
}: {
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  const href = googleReviewHref();
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} aria-label={label} rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Compact Google line: score, yellow stars, review count. Links to the Google reviews. */
export function GoogleReviewInline({ className, starSize = 14 }: { className?: string; starSize?: number }) {
  const score = googleReviewScoreText();
  const count = GOOGLE_REVIEW_STAT.count;
  return (
    <GoogleReviewsLink
      label={`Google ${score}, ${count} reviews`}
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] font-medium text-kg-navy no-underline hover:underline",
        className,
      )}
    >
      <span>Google {score}</span>
      <ReviewStars rating={GOOGLE_REVIEW_STAT.rating} tone="signal" size={starSize} label={`${score} van 5`} />
      <span className="font-normal text-kg-text-2">{count} reviews</span>
    </GoogleReviewsLink>
  );
}
