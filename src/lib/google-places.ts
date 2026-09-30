/**
 * Google Places API (New). Zonder GOOGLE_PLACES_API_KEY slaat de site de
 * fetch over en toont de statische beoordeling uit site.ts. De sleutel
 * wordt nergens gelogd.
 */

import { formatNlNumber } from "@/lib/format";
import { site } from "@/lib/site";

export const DEFAULT_GOOGLE_PLACE_ID = site.googlePlaceId;

const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const FIELD_MASK = "rating,userRatingCount,reviews,googleMapsUri,displayName";

export type GooglePlacesConfig = {
  apiKey: string;
  placeId: string;
};

export type GoogleReview = {
  author: string;
  quote: string;
  score: number;
  relativeTime?: string;
  profileUri?: string;
};

export type GooglePlace = {
  rating: number;
  reviewCount: number;
  mapsUri: string;
  displayName: string;
  reviews: GoogleReview[];
};

export function getGooglePlacesConfig(): GooglePlacesConfig | null {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return null;

  const fromEnv = process.env.GOOGLE_PLACE_ID?.trim();
  const placeId = fromEnv || DEFAULT_GOOGLE_PLACE_ID;
  if (!PLACE_ID_PATTERN.test(placeId)) return null;

  return { apiKey, placeId };
}

export function isGooglePlacesConfigured() {
  return getGooglePlacesConfig() !== null;
}

export function googleRatingLabel(place: GooglePlace | null) {
  if (!place) {
    return `${site.googleScore} · ${site.googleReviews.toLocaleString("nl-NL")} beoordelingen`;
  }
  const count = place.reviewCount.toLocaleString("nl-NL");
  return `${formatNlNumber(place.rating, 1)} · ${count} beoordelingen`;
}

export function googleStarValue(place: GooglePlace | null) {
  if (place) return place.rating;
  const parsed = Number(site.googleScore.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function textOf(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || !("text" in value)) return "";
  const text = (value as { text?: unknown }).text;
  return typeof text === "string" ? text.trim() : "";
}

function mapReview(value: unknown): GoogleReview | null {
  if (!value || typeof value !== "object") return null;
  const review = value as {
    rating?: unknown;
    relativePublishTimeDescription?: unknown;
    text?: unknown;
    originalText?: unknown;
    authorAttribution?: { displayName?: unknown; uri?: unknown };
  };
  const quote = textOf(review.text) || textOf(review.originalText);
  const author =
    typeof review.authorAttribution?.displayName === "string"
      ? review.authorAttribution.displayName.trim()
      : "";
  const score = typeof review.rating === "number" ? review.rating : Number.NaN;
  if (!quote || !author || !Number.isFinite(score) || score < 1 || score > 5) return null;

  const relativeTime =
    typeof review.relativePublishTimeDescription === "string"
      ? review.relativePublishTimeDescription.trim()
      : "";
  const profileUri =
    typeof review.authorAttribution?.uri === "string" ? review.authorAttribution.uri.trim() : "";

  return {
    author,
    quote,
    score,
    relativeTime: relativeTime || undefined,
    profileUri: profileUri || undefined,
  };
}

function mapPlace(data: unknown, fallbackMapsUri: string): GooglePlace | null {
  if (!data || typeof data !== "object") return null;
  const place = data as {
    rating?: unknown;
    userRatingCount?: unknown;
    googleMapsUri?: unknown;
    displayName?: unknown;
    reviews?: unknown;
  };
  const rating = typeof place.rating === "number" ? place.rating : Number.NaN;
  const reviewCount =
    typeof place.userRatingCount === "number" ? place.userRatingCount : Number.NaN;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  if (!Number.isFinite(reviewCount) || reviewCount < 0) return null;

  const mapsUri =
    typeof place.googleMapsUri === "string" && place.googleMapsUri.startsWith("https://")
      ? place.googleMapsUri
      : fallbackMapsUri;
  const displayName = textOf(place.displayName);
  const reviews = Array.isArray(place.reviews)
    ? place.reviews.map(mapReview).filter((review): review is GoogleReview => review !== null).slice(0, 5)
    : [];

  return {
    rating,
    reviewCount,
    mapsUri,
    displayName,
    reviews,
  };
}

export async function getGooglePlace(): Promise<GooglePlace | null> {
  const config = getGooglePlacesConfig();
  if (!config) return null;

  const url = `https://places.googleapis.com/v1/places/${config.placeId}?languageCode=nl`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": config.apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
        Accept: "application/json",
      },
      next: { revalidate: 7200 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`Google Places HTTP ${response.status}`);
      return null;
    }

    const data: unknown = await response.json();
    return mapPlace(data, site.googleMapsUrl);
  } catch {
    console.error("Google Places niet bereikbaar");
    return null;
  }
}
