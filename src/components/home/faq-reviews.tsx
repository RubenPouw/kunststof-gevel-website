"use client";

import { useState } from "react";

import { SectionHead } from "@/components/brand/section-head";
import { StarRow } from "@/components/brand/star-row";
import { faqs, reviews, site } from "@/lib/site";

export type CustomerReview = {
  author: string;
  quote: string;
  score: number | string;
  relativeTime?: string;
  profileUri?: string;
};

function ReviewScore({ score }: { score: number | string }) {
  const numeric = typeof score === "number" ? score : Number(String(score).replace(",", "."));
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) {
    return <StarRow value={numeric} />;
  }
  return <span className="shrink-0">{score}</span>;
}

export function FaqReviews({
  reviews: reviewItems = reviews,
  scoreLabel = `${site.googleScore} · ${site.googleReviews} beoordelingen`,
  mapsUrl = site.googleMapsUrl,
}: {
  reviews?: readonly CustomerReview[];
  scoreLabel?: string;
  mapsUrl?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-kg section-kg mb-16 grid gap-12 lg:grid-cols-[7fr_5fr]">
      <div>
        <SectionHead title="Veelgestelde vragen" aside="01 – 03" />
        <div>
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className="border-b border-kg-lijn">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={expanded}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[13px] text-kg-text-2">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-[17px] font-medium">{item.q}</span>
                  </span>
                  <span className="font-mono text-[18px] text-kg-text-2">{expanded ? "–" : "+"}</span>
                </button>
                {expanded ? (
                  <p className="pb-4 pl-12 text-[15px] leading-[1.5] text-kg-text-2">{item.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <SectionHead title="Klanten" aside={scoreLabel} />
        <div className="grid gap-3">
          {reviewItems.map((review) => (
            <figure key={`${review.author}-${review.quote}`} className="border border-kg-lijn bg-white p-5">
              <blockquote className="line-clamp-4 text-[15px] leading-[1.5]" title={review.quote}>
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-3 flex items-baseline justify-between gap-3 font-mono text-[13px] text-kg-text-2">
                <span className="min-w-0 truncate">
                  {review.profileUri ? (
                    <a
                      href={review.profileUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kg-text-2"
                    >
                      {review.author}
                    </a>
                  ) : (
                    review.author
                  )}
                  {review.relativeTime ? ` · ${review.relativeTime}` : null}
                </span>
                <ReviewScore score={review.score} />
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-mono text-[13px]"
        >
          Alle reviews op Google
        </a>
      </div>
    </section>
  );
}
