import type { Sql } from "@/lib/db/client";
import type { ReviewSummary, StoredReview } from "@/lib/reviews/map";

export const SUMMARY_WEBWINKELKEUR = "reviews_summary_webwinkelkeur";
export const SUMMARY_GOOGLE = "reviews_summary_google";

export async function countReviews(sql: Sql, source?: StoredReview["source"]) {
  const [row] = source
    ? await sql<{ n: number }[]>`select count(*)::int as n from reviews where source = ${source}`
    : await sql<{ n: number }[]>`select count(*)::int as n from reviews`;
  return row?.n ?? 0;
}

export async function upsertReviews(sql: Sql, rows: StoredReview[], fetchedAt: Date) {
  const at = fetchedAt.toISOString();
  for (const row of rows) {
    await sql`
      insert into reviews (
        source, external_id, author_name, rating, text, language,
        created_at, reply_text, verified, source_url, fetched_at
      ) values (
        ${row.source}, ${row.externalId}, ${row.authorName}, ${row.rating}, ${row.text}, ${row.language},
        ${row.createdAt}, ${row.replyText}, ${row.verified}, ${row.sourceUrl}, ${at}
      )
      on conflict (source, external_id) do update set
        author_name = excluded.author_name,
        rating = excluded.rating,
        text = excluded.text,
        language = excluded.language,
        created_at = excluded.created_at,
        reply_text = excluded.reply_text,
        verified = excluded.verified,
        source_url = excluded.source_url,
        fetched_at = excluded.fetched_at
    `;
  }
}

export async function deleteMissingReviews(sql: Sql, source: StoredReview["source"], ids: string[]) {
  if (!ids.length) {
    await sql`delete from reviews where source = ${source}`;
    return;
  }
  await sql`delete from reviews where source = ${source} and not (external_id = any(${ids}))`;
}

export async function deleteReview(sql: Sql, source: StoredReview["source"], externalId: string) {
  await sql`delete from reviews where source = ${source} and external_id = ${externalId}`;
}

export async function purgeExpiredGoogleReviews(sql: Sql) {
  await sql`delete from reviews where source = 'google' and fetched_at < now() - interval '30 days'`;
}

export async function writeReviewSummary(sql: Sql, key: string, summary: ReviewSummary) {
  const value = JSON.stringify({ ...summary, fetchedAt: new Date().toISOString() });
  await sql`
    insert into catalog_state (key, value, updated_at)
    values (${key}, ${value}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

export async function readReviewSummary(sql: Sql, key: string): Promise<(ReviewSummary & { fetchedAt: string }) | null> {
  const [row] = await sql<{ value: string }[]>`select value from catalog_state where key = ${key}`;
  if (!row?.value) return null;
  try {
    const parsed = JSON.parse(row.value) as { amount?: unknown; ratingAverage?: unknown; fetchedAt?: unknown };
    if (typeof parsed.amount !== "number" || typeof parsed.ratingAverage !== "number") return null;
    return {
      amount: parsed.amount,
      ratingAverage: parsed.ratingAverage,
      fetchedAt: typeof parsed.fetchedAt === "string" ? parsed.fetchedAt : "",
    };
  } catch {
    return null;
  }
}
