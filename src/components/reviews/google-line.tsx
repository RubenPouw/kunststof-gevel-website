"use client";

import { lazy, Suspense, useState, type ReactNode } from "react";

import { ReviewStars } from "@/components/reviews/stars";
import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";
import { googleReviewScoreText } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";

const ReviewsModal = lazy(() =>
  import("@/components/reviews/reviews-modal").then((mod) => ({ default: mod.ReviewsModal })),
);

export function GoogleReviewsLink({
  className,
  children,
  label,
}: {
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={cn("cursor-pointer appearance-none border-0 bg-transparent p-0 text-left font-[inherit] text-inherit", className)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {open ? (
        <Suspense fallback={null}>
          <ReviewsModal onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
}

/** Compact Google line: score, yellow stars, review count. Opens the reviews on this page. */
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
