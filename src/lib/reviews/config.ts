/** Public WebwinkelKeur profile. The badge links here. No widget, no script. */
export const WEBWINKELKEUR_PROFILE_URL =
  "https://www.webwinkelkeur.nl/webshop/Kunststof-gevel-nl_1214873";

export const WEBWINKELKEUR_SHOP_ID_DEFAULT = "1214873";

/**
 * Google Business Profile totals while the API is not connected.
 * Change these two numbers when the public profile changes.
 */
export const GOOGLE_REVIEW_STAT = {
  rating: 4.9,
  count: 126,
  href: "https://search.google.com/local/reviews?placeid=ChIJpTqzqNL_hy8RDIC8CeY0l9g",
} as const;

export const GOOGLE_REVIEW_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function webwinkelkeurShopId() {
  return process.env.WEBWINKELKEUR_SHOP_ID?.trim() || WEBWINKELKEUR_SHOP_ID_DEFAULT;
}

export function webwinkelkeurApiKey() {
  return process.env.WEBWINKELKEUR_API_KEY?.trim() || "";
}

/** Subscription secret when it differs from the API key. */
export function webwinkelkeurWebhookSecret() {
  return process.env.WEBWINKELKEUR_WEBHOOK_SECRET?.trim() || webwinkelkeurApiKey();
}

export function googleBusinessConfig() {
  const clientId = process.env.GOOGLE_GBP_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_GBP_CLIENT_SECRET?.trim() || "";
  const refreshToken = process.env.GOOGLE_GBP_REFRESH_TOKEN?.trim() || "";
  const accountId = (process.env.GOOGLE_GBP_ACCOUNT_ID?.trim() || "").replace(/^accounts\//, "");
  const locationId = (process.env.GOOGLE_GBP_LOCATION_ID?.trim() || "").replace(/^locations\//, "");
  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId) return null;
  return { clientId, clientSecret, refreshToken, accountId, locationId };
}
