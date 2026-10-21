import { getSql } from "@/lib/db/client";
import { GOOGLE_REVIEW_STAT, googleBusinessConfig } from "@/lib/reviews/config";
import { googleRowExpired } from "@/lib/reviews/format";
import { readReviewSummary, SUMMARY_GOOGLE, SUMMARY_WEBWINKELKEUR } from "@/lib/reviews/store";

export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  replyText: string | null;
  verified: boolean;
};

export type ReviewSnapshot = {
  webwinkelkeur: { average: number; amount: number } | null;
  google: { rating: number; count: number; href: string };
  reviews: PublicReview[];
};

function staticSnapshot(): ReviewSnapshot {
  return {
    webwinkelkeur: null,
    google: {
      rating: GOOGLE_REVIEW_STAT.rating,
      count: GOOGLE_REVIEW_STAT.count,
      href: GOOGLE_REVIEW_STAT.href,
    },
    reviews: [],
  };
}

export async function getReviewSnapshot(): Promise<ReviewSnapshot> {
  const snapshot = staticSnapshot();
  try {
    const sql = getSql();
    if (!sql) return snapshot;
    const summary = await readReviewSummary(sql, SUMMARY_WEBWINKELKEUR);
    if (summary) snapshot.webwinkelkeur = { average: summary.ratingAverage, amount: summary.amount };

    if (googleBusinessConfig()) {
      const google = await readReviewSummary(sql, SUMMARY_GOOGLE);
      const fresh = google?.fetchedAt ? !googleRowExpired(new Date(google.fetchedAt), new Date()) : false;
      if (google && fresh) {
        snapshot.google = { rating: google.ratingAverage, count: google.amount, href: GOOGLE_REVIEW_STAT.href };
      }
    }

    const rows = await sql<
      {
        external_id: string;
        author_name: string;
        rating: number | string;
        text: string;
        created_at: Date | string;
        reply_text: string | null;
        verified: boolean;
      }[]
    >`select external_id, author_name, rating, text, created_at, reply_text, verified
      from reviews
      where source = 'webwinkelkeur'
      order by created_at desc`;
    snapshot.reviews = rows.map((row) => ({
      id: row.external_id,
      authorName: row.author_name,
      rating: Number(row.rating),
      text: row.text,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      replyText: row.reply_text,
      verified: row.verified,
    }));
    return snapshot;
  } catch (error) {
    console.error("[reviews] lezen mislukt", error instanceof Error ? error.message : "fout");
    return snapshot;
  }
}
