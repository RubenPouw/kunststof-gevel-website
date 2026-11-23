import reviewsFile from "@/data/reviews.json";
import { formatReviewDate } from "@/lib/reviews/format";

/** Cards longer than this get a "Meer lezen" control. */
export const REVIEW_TEXT_PREVIEW = 180;

export type GoogleReviewCard = {
  author: string;
  rating: number;
  date: string;
  text: string;
};

/** First name plus the initial of the last name, as shown on the card. */
export function reviewDisplayName(author: string) {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first;
  const last = (parts[parts.length - 1] ?? "").replace(/\./g, "");
  const initial = last.charAt(0).toLocaleUpperCase("nl-NL");
  if (!initial) return first;
  return `${first} ${initial}.`;
}

export function isLongReview(text: string) {
  return text.trim().length > REVIEW_TEXT_PREVIEW;
}

export function reviewDateLabel(value: string) {
  const date = value.trim();
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return formatReviewDate(date);
  return date;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Keeps only complete public reviews. Rows without a name or text are dropped. */
export function readGoogleReviewCards(raw: unknown): GoogleReviewCard[] {
  const record = asRecord(raw);
  const list = Array.isArray(raw) ? raw : record?.reviews;
  if (!Array.isArray(list)) return [];
  const cards: GoogleReviewCard[] = [];
  for (const item of list) {
    const row = asRecord(item);
    if (!row) continue;
    const text = typeof row.text === "string" ? row.text.trim() : "";
    const author = typeof row.author === "string" ? reviewDisplayName(row.author) : "";
    const rating = typeof row.rating === "number" ? row.rating : Number.NaN;
    if (!text || !author) continue;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) continue;
    const date = typeof row.date === "string" ? row.date.trim() : "";
    cards.push({ author, rating, date, text });
  }
  return cards;
}

export function googleReviewCards() {
  return readGoogleReviewCards(reviewsFile);
}
