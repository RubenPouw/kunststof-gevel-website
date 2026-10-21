import { createHmac, timingSafeEqual } from "node:crypto";

import { GOOGLE_REVIEW_STAT, WEBWINKELKEUR_PROFILE_URL } from "@/lib/reviews/config";

export type ReviewSource = "webwinkelkeur" | "google";

export type StoredReview = {
  source: ReviewSource;
  externalId: string;
  authorName: string;
  rating: number;
  text: string;
  language: string;
  createdAt: string;
  replyText: string | null;
  verified: boolean;
  sourceUrl: string | null;
};

export type ReviewSummary = {
  amount: number;
  ratingAverage: number;
};

const GOOGLE_STARS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function textOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function replyText(value: unknown) {
  const direct = textOrNull(value);
  if (direct) return direct;
  const row = asRecord(value);
  if (!row) return null;
  return textOrNull(row.comment) ?? textOrNull(row.text);
}

/** Calendar day at noon UTC, so the Dutch date does not slip. */
export function reviewCreatedAt(value: string) {
  const day = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return `${day}T12:00:00.000Z`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function mapWebwinkelkeurRating(raw: unknown, sourceUrl = WEBWINKELKEUR_PROFILE_URL): StoredReview | null {
  const row = asRecord(raw);
  if (!row || row.quarantine === true) return null;
  if (typeof row.id !== "number" && typeof row.id !== "string") return null;
  if (typeof row.rating !== "number" || row.rating < 1 || row.rating > 5) return null;
  const created = reviewCreatedAt(textOrNull(row.created) ?? textOrNull(row.date) ?? "");
  if (!created) return null;
  return {
    source: "webwinkelkeur",
    externalId: String(row.id),
    authorName: textOrNull(row.name) ?? "Anoniem",
    rating: row.rating,
    text: textOrNull(row.comment) ?? "",
    language: textOrNull(row.language) ?? "",
    createdAt: created,
    replyText: replyText(row.reaction),
    verified: row.verified === true,
    sourceUrl,
  };
}

export function mapWebwinkelkeurSummary(raw: unknown): ReviewSummary | null {
  const row = asRecord(raw);
  const data = asRecord(row?.data) ?? row;
  if (!data) return null;
  const amount = data.amount;
  const ratingAverage = data.rating_average;
  if (typeof amount !== "number" || typeof ratingAverage !== "number") return null;
  if (amount < 0 || ratingAverage < 0 || ratingAverage > 10) return null;
  return { amount, ratingAverage };
}

export function mapGoogleReview(raw: unknown): StoredReview | null {
  const row = asRecord(raw);
  if (!row) return null;
  const externalId = textOrNull(row.reviewId) ?? textOrNull(row.name);
  const stars = typeof row.starRating === "string" ? GOOGLE_STARS[row.starRating] : undefined;
  if (!externalId || !stars) return null;
  const reviewer = asRecord(row.reviewer);
  const created = reviewCreatedAt(textOrNull(row.createTime) ?? textOrNull(row.updateTime) ?? "");
  if (!created) return null;
  return {
    source: "google",
    externalId,
    authorName: textOrNull(reviewer?.displayName) ?? "Anoniem",
    rating: stars,
    text: textOrNull(row.comment) ?? "",
    language: "",
    createdAt: created,
    replyText: replyText(row.reviewReply),
    verified: false,
    sourceUrl: GOOGLE_REVIEW_STAT.href,
  };
}

export function mapGoogleSummary(raw: unknown): ReviewSummary | null {
  const row = asRecord(raw);
  if (!row) return null;
  const amount = row.totalReviewCount;
  const ratingAverage = row.averageRating;
  if (typeof amount !== "number" || typeof ratingAverage !== "number") return null;
  if (amount < 0 || ratingAverage < 0 || ratingAverage > 5) return null;
  return { amount, ratingAverage };
}

export function webhookHash(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function webhookHashMatches(body: string, secret: string, header: string | null) {
  if (!secret || !header) return false;
  const expected = Buffer.from(webhookHash(body, secret));
  const actual = Buffer.from(header.trim().toLowerCase());
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function webhookReviewId(payload: unknown) {
  const row = asRecord(payload);
  if (!row) return null;
  const nested = asRecord(row.review) ?? asRecord(row.data) ?? row;
  if (typeof nested.id === "number" || typeof nested.id === "string") return String(nested.id);
  return null;
}
