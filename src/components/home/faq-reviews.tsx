"use client";

import { useState } from "react";

import { faqs, reviews, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FaqReviews() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container-kg section-kg mb-16 grid gap-12 lg:grid-cols-2">
      <div>
        <h2 className="font-heading text-[36px] leading-none font-bold uppercase">Veelgestelde vragen</h2>
        <div className="mt-6 border-t border-[var(--color-border)]">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className="border-b border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={expanded}
                >
                  <span className="font-heading text-[20px] font-semibold">{item.q}</span>
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center text-[18px] leading-none",
                      expanded ? "bg-brand text-white" : "bg-tint text-kg-blue-deep",
                    )}
                  >
                    {expanded ? "–" : "+"}
                  </span>
                </button>
                {expanded ? (
                  <p className="pb-4 text-[15px] leading-[1.65] text-[var(--color-text-soft)]">{item.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-end gap-4 bg-brand px-5 py-4 text-white">
          <p className="font-heading text-[28px] leading-none font-bold">{site.googleScore}</p>
          <p className="text-[13px] text-[var(--kg-blue-100)]">
            Google reviews / {site.googleReviews} beoordelingen
          </p>
        </div>
        <div className="grid gap-px bg-[var(--color-border)]">
          {reviews.map((review) => (
            <figure key={review.author} className="bg-surface p-5">
              <p className="text-[15px] tracking-widest text-brand">● ● ● ● ●</p>
              <blockquote className="mt-3 text-[15px] leading-[1.6]">“{review.quote}”</blockquote>
              <figcaption className="mt-3 text-[13px] text-[var(--color-text-muted)]">{review.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
