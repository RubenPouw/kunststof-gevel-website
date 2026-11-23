import { GoogleReviewsLink } from "@/components/reviews/google-line";
import { GoogleMark } from "@/components/reviews/google-mark";
import { ReviewStars } from "@/components/reviews/stars";
import { buttonVariants } from "@/components/ui/button";
import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";
import { googleReviewScoreText, webwinkelkeurFootnote } from "@/lib/reviews/format";
import { cn } from "@/lib/utils";

export type WebwinkelkeurScore = { average: number; amount: number };

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
