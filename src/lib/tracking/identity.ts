import { createHash, randomUUID } from "node:crypto";

import { cleanClickIds, type ClickIds } from "./clicks";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type { ClickIds } from "./clicks";
export { cleanClickId, cleanClickIds } from "./clicks";

export type AdsState = ClickIds & {
  clientId: string;
};

export function cleanClientId(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return UUID.test(trimmed) ? trimmed : undefined;
}

export function newClientId() {
  return randomUUID();
}

/** E-mail zoals Google die verwacht vóór de hash: klein, getrimd, punten uit Gmail. */
export function normalizeEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return "";
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") local = local.replace(/\./g, "");
  const plus = local.indexOf("+");
  if (plus >= 0 && (domain === "gmail.com" || domain === "googlemail.com")) local = local.slice(0, plus);
  if (!local || !domain.includes(".")) return "";
  return `${local}@${domain}`;
}

/** Telefoon in E.164, met plus. Leeg als het nummer niet bruikbaar is. */
export function normalizePhone(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+") && compact.length >= 10 && compact.length <= 16) return compact;
  if (compact.startsWith("00") && compact.length >= 11) return `+${compact.slice(2)}`;
  if (compact.startsWith("0") && compact.length >= 10) return `+31${compact.slice(1)}`;
  return "";
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function encodeAdsState(state: AdsState) {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeAdsState(value: string | undefined | null): AdsState | null {
  if (!value || value.length > 800) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<AdsState>;
    const clientId = cleanClientId(parsed.clientId);
    if (!clientId) return null;
    return { clientId, ...cleanClickIds(parsed) };
  } catch {
    return null;
  }
}
