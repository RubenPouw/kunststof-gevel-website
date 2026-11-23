"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";

import { GoogleMark } from "@/components/reviews/google-mark";
import { ReviewStars } from "@/components/reviews/stars";
import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";
import {
  googleReviewCards,
  isLongReview,
  reviewDateLabel,
  type GoogleReviewCard,
} from "@/lib/reviews/cards";
import { googleReviewHref, googleReviewScoreText } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";

function ReviewCard({ review }: { review: GoogleReviewCard }) {
  const [expanded, setExpanded] = useState(false);
  const long = isLongReview(review.text);
  const date = reviewDateLabel(review.date);
  return (
    <li className="border border-kg-lijn bg-white p-4">
      <p className="text-[15px] font-medium">
        {review.author}
        {date ? <span className="ml-2 font-mono text-[13px] font-normal text-kg-text-2">{date}</span> : null}
      </p>
      <div className="mt-2">
        <ReviewStars rating={review.rating} tone="signal" size={14} label={`${review.rating} van 5`} />
      </div>
      <p className={cn("mt-3 text-[15px] leading-[1.6] whitespace-pre-line", long && !expanded && "line-clamp-4")}>{review.text}</p>
      {long ? (
        <button type="button" className="mt-2 text-[13px] font-medium underline underline-offset-[3px]" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Minder" : "Meer lezen"}
        </button>
      ) : null}
    </li>
  );
}

/** On-page Google reviews. The profile link at the bottom is the only way out. */
export function ReviewsModal({
  onClose,
  reviews = googleReviewCards(),
}: {
  onClose: () => void;
  reviews?: GoogleReviewCard[];
}) {
  const score = googleReviewScoreText();
  const count = GOOGLE_REVIEW_STAT.count;
  return (
    <Dialog.Root
      open
      modal
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop data-reviews-backdrop="" className="fixed inset-0 z-[90] bg-kg-navy/40" />
        <Dialog.Popup
          data-reviews-modal=""
          aria-modal="true"
          className="fixed z-[91] flex min-h-0 flex-col overflow-hidden bg-white text-kg-navy shadow-none inset-x-0 bottom-0 max-h-[min(85vh,760px)] rounded-none border-t border-kg-lijn sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-[min(560px,calc(100%-48px))] sm:max-h-[min(80vh,760px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:border-kg-lijn"
        >
          <div className="relative border-b border-kg-lijn px-5 py-4 pr-16">
            <Dialog.Title className="flex items-center gap-2 text-[16px] font-medium">
              <GoogleMark />
              Google
            </Dialog.Title>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[28px] leading-none font-medium tracking-[-0.03em]">{score}</span>
              <ReviewStars rating={GOOGLE_REVIEW_STAT.rating} tone="signal" size={18} label={`${score} van 5`} />
            </div>
            <Dialog.Description className="mt-2 text-[14px] text-kg-text-2">{count} reviews op Google</Dialog.Description>
            <Dialog.Close
              aria-label="Sluiten"
              className="absolute top-3 right-3 grid size-11 place-items-center border border-kg-navy bg-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </Dialog.Close>
          </div>
          {reviews.length ? (
            <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
              {reviews.map((review) => (
                <ReviewCard key={`${review.author}-${review.date}-${review.text.slice(0, 24)}`} review={review} />
              ))}
            </ul>
          ) : null}
          <div className="border-t border-kg-lijn px-5 py-3">
            <a
              href={googleReviewHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-kg-text-2 underline underline-offset-[3px]"
            >
              Bekijk alle reviews op Google
            </a>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
