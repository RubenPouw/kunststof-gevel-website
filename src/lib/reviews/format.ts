import { GOOGLE_REVIEW_STAT } from "@/lib/reviews/config";

export function formatDutchScore(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function googleScoreLabel(rating: number = GOOGLE_REVIEW_STAT.rating, count: number = GOOGLE_REVIEW_STAT.count) {
  return `Google ${formatDutchScore(rating)} / ${count} reviews`;
}

export function formatReviewDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Amsterdam",
  });
}

export function googleRowExpired(fetchedAt: Date, now: Date) {
  return now.getTime() - fetchedAt.getTime() > 30 * 24 * 60 * 60 * 1000;
}
