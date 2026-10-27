import { cleanClickIds } from "./clicks";

const CONSENT_KEY = "kg-consent";
const PENDING_KEY = "kg-ads-pending";

export type BrowserConsent = "granted" | "denied";

export function browserConsent(): BrowserConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function readPendingClicks() {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(PENDING_KEY) || "{}") as Record<string, unknown>;
    return cleanClickIds(raw);
  } catch {
    return {};
  }
}

export function clearPendingClicks() {
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Het tabblad bewaart de klikcode dan tot het sluit.
  }
}

/** Zet of wist de httpOnly-cookie. De keuze in localStorage doet de banner zelf. */
export async function publishConsent(choice: BrowserConsent) {
  const clicks = choice === "granted" ? readPendingClicks() : {};
  if (choice === "denied") clearPendingClicks();
  try {
    const response = await fetch("/api/tracking/toestemming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice, ...clicks }),
      keepalive: true,
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok && choice === "granted") clearPendingClicks();
    return response.ok;
  } catch {
    return false;
  }
}

export function trackBrowserEvent(
  name: "configurator_gestart" | "configurator_afgerond",
  params: Record<string, string | number>,
) {
  if (browserConsent() !== "granted") return;
  try {
    void fetch("/api/tracking/gebeurtenis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, params }),
      keepalive: true,
    });
  } catch {
    // Meten mag de configurator niet raken.
  }
}
