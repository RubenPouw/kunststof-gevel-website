import Link from "next/link";

import { KeurmerkLink } from "@/components/reviews/keurmerk";
import { formatDutchScore, googleScoreLabel } from "@/lib/reviews/format";
import type { ReviewSnapshot } from "@/lib/reviews/read";

export function ReviewScoreStrip({ snapshot }: { snapshot: ReviewSnapshot }) {
  const googleLabel = googleScoreLabel(snapshot.google.rating, snapshot.google.count);
  const wwk = snapshot.webwinkelkeur;
  const wwkLabel = wwk
    ? `WebwinkelKeur ${formatDutchScore(wwk.average)} / 10, ${wwk.amount} beoordelingen`
    : "";
  return (
    <section className="border-b border-kg-lijn bg-white" aria-label="Beoordelingen">
      <div className="container-kg flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:gap-12">
          {wwk ? (
            <Link
              href="/reviews"
              aria-label={wwkLabel}
              className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 text-inherit no-underline hover:no-underline"
            >
              <span className="font-mono text-[13px] text-kg-text-2">WebwinkelKeur</span>
              <span className="text-[22px] font-medium tracking-[-0.03em]">{formatDutchScore(wwk.average)}</span>
              <span className="font-mono text-[13px] text-kg-text-2">/ 10</span>
              <span className="font-mono text-[13px] text-kg-text-2">{wwk.amount} beoordelingen</span>
            </Link>
          ) : (
            <KeurmerkLink />
          )}
          <a
            href={snapshot.google.href}
            aria-label={googleLabel}
            className="inline-flex items-baseline gap-3 text-inherit no-underline hover:no-underline"
          >
            <span className="font-mono text-[13px] text-kg-text-2">Google</span>
            <span className="text-[22px] font-medium tracking-[-0.03em]">{formatDutchScore(snapshot.google.rating)}</span>
            <span className="font-mono text-[13px] text-kg-text-2">/ {snapshot.google.count} reviews</span>
          </a>
        </div>
        {wwk ? <KeurmerkLink /> : null}
      </div>
    </section>
  );
}