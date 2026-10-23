import { decodeAdsState, type AdsState } from "./identity";

export function consentGranted(cookieHeader: string | null | undefined) {
  return readCookie(cookieHeader, "kg_consent") === "granted";
}

export function adsFromCookies(cookieHeader: string | null | undefined): AdsState | null {
  if (!consentGranted(cookieHeader)) return null;
  return decodeAdsState(readCookie(cookieHeader, "kg_ads"));
}

export function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return "";
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return "";
}
