"use client";

import { useState } from "react";

import { SectionHead } from "@/components/brand/section-head";
import { faqs, reviews, site } from "@/lib/site";

export function FaqReviews() {
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
        <SectionHead title="Klanten" aside={`${site.googleScore} · ${site.googleReviews} beoordelingen`} />
        <div className="grid gap-3">
          {reviews.map((review) => (
            <figure key={review.author} className="border border-kg-lijn bg-white p-5">
              <blockquote className="text-[15px] leading-[1.5]">“{review.quote}”</blockquote>
              <figcaption className="mt-3 flex justify-between font-mono text-[13px] text-kg-text-2">
                <span>{review.author}</span>
                <span>{review.score}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
