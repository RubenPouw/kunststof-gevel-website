import { GoogleReviewsLink } from "@/components/reviews/google-line";
import { ReviewStars } from "@/components/reviews/stars";
import { buttonVariants } from "@/components/ui/button";
import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";
import { googleReviewScoreText, webwinkelkeurFootnote } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";

export type WebwinkelkeurScore = { average: number; amount: number };

function GoogleMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/** Variant C: Google first and large, WebwinkelKeur as a footnote when live data exists. */
export function ReviewScoreStrip({ webwinkelkeur }: { webwinkelkeur: WebwinkelkeurScore | null }) {
  const score = googleReviewScoreText();
  const count = GOOGLE_REVIEW_STAT.count;
  return (
    <section className="border-y border-kg-lijn bg-white" aria-label="Google reviews">
      <div className="container-kg py-4 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <GoogleReviewsLink
            label={`Google ${score}, ${count} reviews`}
            className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 text-inherit no-underline hover:no-underline"
          >
            <GoogleMark />
            <span className="text-[16px] font-medium">Google</span>
            <span className="text-[28px] leading-none font-medium tracking-[-0.03em] sm:text-[32px]">{score}</span>
            <ReviewStars rating={GOOGLE_REVIEW_STAT.rating} tone="signal" size={18} label={`${score} van 5`} />
            <span className="font-mono text-[14px] text-kg-text-2">{count} reviews</span>
          </GoogleReviewsLink>
          <GoogleReviewsLink
            className={cn(
              buttonVariants({ variant: "primary", size: "sm" }),
              "w-full no-underline hover:no-underline sm:w-auto",
            )}
          >
            Lees alle reviews
          </GoogleReviewsLink>
        </div>
        {webwinkelkeur ? (
          <p className="mt-3 border-t border-kg-lijn pt-3 text-[13px] text-kg-text-2">
            {webwinkelkeurFootnote(webwinkelkeur.average, webwinkelkeur.amount)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
