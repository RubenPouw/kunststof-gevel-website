import type { Sql } from "@/lib/db/client";
import { getSql } from "@/lib/db/client";
import { googleBusinessConfig, webwinkelkeurApiKey, webwinkelkeurShopId } from "@/lib/reviews/config";
import {
  mapGoogleReview,
  mapGoogleSummary,
  mapWebwinkelkeurRating,
  mapWebwinkelkeurSummary,
  type StoredReview,
} from "@/lib/reviews/map";
import {
  countReviews,
  deleteMissingReviews,
  deleteReview,
  purgeExpiredGoogleReviews,
  SUMMARY_GOOGLE,
  SUMMARY_WEBWINKELKEUR,
  upsertReviews,
  writeReviewSummary,
} from "@/lib/reviews/store";

type FetchLike = typeof fetch;

const RATINGS_URL = "https://dashboard.webwinkelkeur.nl/api/1.0/ratings.json";
const SUMMARY_URL = "https://dashboard.webwinkelkeur.nl/api/1.0/ratings_summary.json";

async function readJson(response: Response) {
  if (!response.ok) throw new Error(`reviews http ${response.status}`);
  return (await response.json()) as unknown;
}

export async function syncWebwinkelkeur(deps?: { fetch?: FetchLike; sql?: Sql }) {
  const sql = deps?.sql ?? getSql();
  const key = webwinkelkeurApiKey();
  if (!sql) return { ok: false as const, reason: "database" };
  if (!key) return { ok: false as const, reason: "config" };
  const fetchImpl = deps?.fetch ?? fetch;
  const id = webwinkelkeurShopId();
  const auth = new URLSearchParams({ id, code: key });

  let summaryOk = false;
  try {
    const summary = mapWebwinkelkeurSummary(
      await readJson(await fetchImpl(`${SUMMARY_URL}?${auth}`, { signal: AbortSignal.timeout(15000) })),
    );
    if (summary) {
      await writeReviewSummary(sql, SUMMARY_WEBWINKELKEUR, summary);
      summaryOk = true;
    }
  } catch (error) {
    console.error("[reviews] webwinkelkeur samenvatting mislukt", error instanceof Error ? error.message : "fout");
  }

  try {
    const raw: unknown[] = [];
    let offset = 0;
    for (let page = 0; page < 20; page += 1) {
      const query = new URLSearchParams({ id, code: key, limit: "100", offset: String(offset) });
      const body = (await readJson(
        await fetchImpl(`${RATINGS_URL}?${query}`, { signal: AbortSignal.timeout(20000) }),
      )) as { status?: string; total?: number; ratings?: unknown[] };
      if (body.status !== "success" || !Array.isArray(body.ratings)) throw new Error("ratings antwoord");
      raw.push(...body.ratings);
      if (body.ratings.length < 100) break;
      if (typeof body.total === "number" && raw.length >= body.total) break;
      offset += body.ratings.length;
    }
    const rows = raw.map((item) => mapWebwinkelkeurRating(item)).filter((item): item is StoredReview => item !== null);
    const fetchedAt = new Date();
    await upsertReviews(sql, rows, fetchedAt);
    await deleteMissingReviews(
      sql,
      "webwinkelkeur",
      rows.map((row) => row.externalId),
    );
    return { ok: true as const, count: rows.length, summary: summaryOk };
  } catch (error) {
    console.error("[reviews] webwinkelkeur lijst mislukt", error instanceof Error ? error.message : "fout");
    return { ok: false as const, reason: "api", summary: summaryOk };
  }
}

export async function syncGoogle(deps?: { fetch?: FetchLike; sql?: Sql }) {
  const sql = deps?.sql ?? getSql();
  const config = googleBusinessConfig();
  if (!sql) return { ok: false as const, reason: "database" };
  if (!config) return { ok: false as const, reason: "config" };
  const fetchImpl = deps?.fetch ?? fetch;
  const tokenResponse = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15000),
  });
  const tokenBody = (await tokenResponse.json().catch(() => null)) as { access_token?: string } | null;
  if (!tokenResponse.ok || !tokenBody?.access_token) {
    console.error("[reviews] google token geweigerd");
    return { ok: false as const, reason: "api" };
  }

  const raw: unknown[] = [];
  let summarySaved = false;
  let pageToken = "";
  for (let page = 0; page < 10; page += 1) {
    const query = new URLSearchParams({ pageSize: "50" });
    if (pageToken) query.set("pageToken", pageToken);
    const url = `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(config.accountId)}/locations/${encodeURIComponent(config.locationId)}/reviews?${query}`;
    const response = await fetchImpl(url, {
      headers: { authorization: `Bearer ${tokenBody.access_token}` },
      signal: AbortSignal.timeout(20000),
    });
    const body = (await readJson(response)) as {
      reviews?: unknown[];
      nextPageToken?: string;
      averageRating?: number;
      totalReviewCount?: number;
    };
    if (!summarySaved) {
      const summary = mapGoogleSummary(body);
      if (summary) {
        await writeReviewSummary(sql, SUMMARY_GOOGLE, summary);
        summarySaved = true;
      }
    }
    if (Array.isArray(body.reviews)) raw.push(...body.reviews);
    if (!body.nextPageToken) break;
    pageToken = body.nextPageToken;
  }

  const rows = raw.map((item) => mapGoogleReview(item)).filter((item): item is StoredReview => item !== null);
  await upsertReviews(sql, rows, new Date());
  return { ok: true as const, count: rows.length, summary: summarySaved };
}

export async function syncReviews(deps?: { fetch?: FetchLike; sql?: Sql }) {
  const sql = deps?.sql ?? getSql();
  if (!sql) return { ok: false as const, reason: "database" };
  const webwinkelkeur = await syncWebwinkelkeur({ ...deps, sql });
  let google: Awaited<ReturnType<typeof syncGoogle>>;
  try {
    google = await syncGoogle({ ...deps, sql });
  } catch (error) {
    console.error("[reviews] google sync mislukt", error instanceof Error ? error.message : "fout");
    google = { ok: false, reason: "api" };
  }
  await purgeExpiredGoogleReviews(sql);
  return { ok: true as const, webwinkelkeur, google };
}

export async function syncReviewsIfEmpty() {
  const sql = getSql();
  if (!sql) return { ok: false as const, reason: "database" };
  const count = await countReviews(sql);
  if (count > 0) return { ok: true as const, skipped: true as const };
  return syncReviews({ sql });
}

export async function applyReviewWebhook(sql: Sql, topic: string, payload: unknown) {
  const row = payload && typeof payload === "object" ? payload : null;
  const nested =
    row && "review" in row && row.review && typeof row.review === "object"
      ? row.review
      : row && "data" in row && row.data && typeof row.data === "object" && !("amount" in (row.data as object))
        ? row.data
        : row;
  const mapped = mapWebwinkelkeurRating(nested);
  const id =
    mapped?.externalId ??
    (nested && typeof nested === "object" && "id" in nested && (typeof nested.id === "string" || typeof nested.id === "number")
      ? String(nested.id)
      : null);
  if (!id) return { ok: false as const, reason: "payload" };
  if (topic === "reviews.deleted" || (nested && typeof nested === "object" && "quarantine" in nested && nested.quarantine === true)) {
    await deleteReview(sql, "webwinkelkeur", id);
    return { ok: true as const, action: "delete" as const, id };
  }
  if (!mapped) return { ok: false as const, reason: "payload" };
  await upsertReviews(sql, [mapped], new Date());
  return { ok: true as const, action: "upsert" as const, id };
}

