import { cleanClickIds } from "./clicks";
import { decodeAdsState, encodeAdsState, newClientId, type AdsState } from "./identity";

export const CONSENT_COOKIE = "kg_consent";
export const ADS_COOKIE = "kg_ads";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export function trackingCookieOptions(maxAge = COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** ads null wist de meetcookie. De route zet de httpOnly-cookies. */
export function consentDecision(
  choice: "granted" | "denied",
  input: { existing?: string | null; clicks?: { gclid?: unknown; gbraid?: unknown; wbraid?: unknown } },
): { consent: "granted" | "denied"; ads: string | null } {
  if (choice === "denied") return { consent: "denied", ads: null };
  const prev = decodeAdsState(input.existing);
  const clicks = cleanClickIds(input.clicks ?? {});
  const state: AdsState = {
    clientId: prev?.clientId ?? newClientId(),
    gclid: clicks.gclid ?? prev?.gclid,
    gbraid: clicks.gbraid ?? prev?.gbraid,
    wbraid: clicks.wbraid ?? prev?.wbraid,
  };
  return { consent: "granted", ads: encodeAdsState(state) };
}
