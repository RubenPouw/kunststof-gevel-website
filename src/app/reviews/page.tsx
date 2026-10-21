import type { Metadata } from "next";
import Link from "next/link";

import { KeurmerkLink } from "@/components/reviews/keurmerk";
import { ReviewScoreStrip } from "@/components/reviews/score-strip";
import { ReviewStars } from "@/components/reviews/stars";
import { formatReviewDate } from "@/lib/reviews/format";
import { getReviewSnapshot } from "@/lib/reviews/read";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Alle gepubliceerde WebwinkelKeur-reviews van kunststof-gevel.nl, ook de lage scores. Google staat apart.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const snapshot = await getReviewSnapshot();
  return (
    <article className="pb-24">
      <ReviewScoreStrip snapshot={snapshot} />
      <div className="container-kg pt-12 sm:pt-16">
        <nav aria-label="Kruimelpad" className="font-mono text-[13px] text-kg-text-2">
          <Link href="/" className="no-underline hover:underline">
            Home
          </Link>
          {" / "}
          <span>Reviews</span>
        </nav>
        <h1 className="mt-4 text-[34px] leading-[1.05] font-medium tracking-[-0.04em] sm:text-[44px]">Reviews</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-[16px] leading-[1.65] text-kg-text-2">
          <p>
            Beoordelingen op deze pagina komen van WebwinkelKeur. Na een bestelling kan een klant een uitnodiging
            krijgen. Wij tonen elke gepubliceerde review, ook een lage score. Een review die bij WebwinkelKeur in
            quarantaine staat, tonen wij niet.
          </p>
          <p>
            Wij herschrijven de tekst niet. Staat er een reactie van ons onder, dan is dat een antwoord en geen
            onderdeel van de review. Het cijfer van WebwinkelKeur is een gemiddelde op een schaal van 10 en telt ook
            geïmporteerde reviews mee. Google staat apart, met een eigen cijfer, en telt niet mee in dat gemiddelde.
            Wij kopen geen reviews en filteren niet op alleen positieve.
          </p>
        </div>
        <p className="mt-8">
          <KeurmerkLink />
        </p>

        {snapshot.reviews.length ? (
          <ul className="mt-16 border-b border-kg-lijn">
            {snapshot.reviews.map((review) => (
              <li key={review.id} className="border-t border-kg-lijn py-10">
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="text-[18px] font-medium tracking-[-0.02em]">{review.authorName}</h2>
                  <time className="shrink-0 font-mono text-[13px] text-kg-text-2" dateTime={review.createdAt}>
                    {formatReviewDate(review.createdAt)}
                  </time>
                </div>
                <div className="mt-3">
                  <ReviewStars rating={review.rating} />
                </div>
                {review.verified ? (
                  <p className="mt-3 font-mono text-[13px] text-kg-text-2">Geverifieerd via WebwinkelKeur</p>
                ) : null}
                {review.text ? (
                  <p className="mt-4 max-w-2xl text-[17px] leading-[1.7]">{review.text}</p>
                ) : (
                  <p className="mt-4 max-w-2xl text-[17px] leading-[1.7] text-kg-text-2">Geen toelichting.</p>
                )}
                {review.replyText ? (
                  <div className="mt-6 max-w-2xl border-l border-kg-navy pl-4">
                    <p className="font-mono text-[13px] text-kg-text-2">Onze reactie</p>
                    <p className="mt-2 text-[15px] leading-[1.65]">{review.replyText}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-16 max-w-xl text-[17px] leading-[1.7]">Er staan nog geen reviews.</p>
        )}
      </div>
    </article>
  );
}