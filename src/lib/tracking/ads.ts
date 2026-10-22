import type { EventName, EventParams } from "./events";
import type { ClickIds } from "./identity";
import { normalizeEmail, normalizePhone, sha256 } from "./identity";

const ACTION_ENV = {
  offertemand_verzonden: "GOOGLE_ADS_CONVERSION_OFFERTE",
  staalaanvraag_verzonden: "GOOGLE_ADS_CONVERSION_STAAL",
  bestelling: "GOOGLE_ADS_CONVERSION_BESTELLING",
} as const;

export function adsConfigured(env: NodeJS.ProcessEnv) {
  return (
    env.TRACKING_ADS_ACTIEF === "true" &&
    Boolean(env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()) &&
    Boolean(digits(env.GOOGLE_ADS_CUSTOMER_ID)) &&
    Boolean(env.GOOGLE_ADS_CLIENT_ID?.trim()) &&
    Boolean(env.GOOGLE_ADS_CLIENT_SECRET?.trim()) &&
    Boolean(env.GOOGLE_ADS_REFRESH_TOKEN?.trim())
  );
}

export function conversionAction(name: EventName, env: NodeJS.ProcessEnv) {
  if (!(name in ACTION_ENV)) return "";
  const customer = digits(env.GOOGLE_ADS_CUSTOMER_ID);
  const raw = String(env[ACTION_ENV[name as keyof typeof ACTION_ENV]] ?? "").trim();
  if (!customer || !raw) return "";
  if (raw.startsWith("customers/")) return raw;
  if (/^\d+$/.test(raw)) return `customers/${customer}/conversionActions/${raw}`;
  return "";
}

export function conversionValue(name: EventName, params: EventParams) {
  if (name === "offertemand_verzonden" && typeof params.totaalwaarde === "number") return params.totaalwaarde;
  if (name === "bestelling" && typeof params.waarde === "number") return params.waarde;
  return undefined;
}

export function buildClickConversion(input: {
  name: EventName;
  params: EventParams;
  clicks: ClickIds;
  email?: string;
  phone?: string;
  orderId?: string;
  env: NodeJS.ProcessEnv;
  now?: Date;
}) {
  const action = conversionAction(input.name, input.env);
  const click = oneClick(input.clicks);
  if (!action || !click) return null;
  const when = formatAdsTime(input.now ?? new Date());
  const value = conversionValue(input.name, input.params);
  const identifiers = userIdentifiers(input.email, input.phone);
  return {
    conversionAction: action,
    conversionDateTime: when,
    currencyCode: "EUR",
    consent: { adUserData: "GRANTED", adPersonalization: "GRANTED" },
    ...(value == null ? {} : { conversionValue: value }),
    ...(input.orderId ? { orderId: input.orderId.slice(0, 64) } : {}),
    ...(identifiers.length ? { userIdentifiers: identifiers } : {}),
    ...click,
  };
}

export async function sendAdsConversion(
  input: {
    name: EventName;
    params: EventParams;
    clicks: ClickIds;
    email?: string;
    phone?: string;
    orderId?: string;
  },
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch = fetch,
  now?: Date,
) {
  if (!adsConfigured(env)) return { sent: false as const, reason: "uit" as const };
  const conversion = buildClickConversion({ ...input, env, now });
  if (!conversion) return { sent: false as const, reason: "geen-klik" as const };
  const token = await accessToken(env, fetchImpl);
  if (!token) return { sent: false as const, reason: "geen-token" as const };
  const customer = digits(env.GOOGLE_ADS_CUSTOMER_ID);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN!.trim(),
    "Content-Type": "application/json",
  };
  const login = digits(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  if (login) headers["login-customer-id"] = login;
  const response = await fetchImpl(`https://googleads.googleapis.com/v20/customers/${customer}:uploadClickConversions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ conversions: [conversion], partialFailure: true }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return { sent: false as const, reason: "google" as const, status: response.status };
  const json = (await response.json().catch(() => null)) as { partialFailureError?: unknown } | null;
  if (json?.partialFailureError) return { sent: false as const, reason: "google" as const };
  return { sent: true as const };
}

let cached: { token: string; until: number } | null = null;

export function resetAdsTokenCache() {
  cached = null;
}

async function accessToken(env: NodeJS.ProcessEnv, fetchImpl: typeof fetch) {
  if (cached && cached.until > Date.now() + 30_000) return cached.token;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: env.GOOGLE_ADS_CLIENT_ID!.trim(),
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET!.trim(),
    refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN!.trim(),
  });
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) return "";
  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return "";
  cached = { token: json.access_token, until: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return json.access_token;
}

function userIdentifiers(email?: string, phone?: string) {
  const identifiers: { hashedEmail?: string; hashedPhoneNumber?: string; userIdentifierSource: "FIRST_PARTY" }[] = [];
  const mail = email ? normalizeEmail(email) : "";
  const tel = phone ? normalizePhone(phone) : "";
  if (mail) identifiers.push({ hashedEmail: sha256(mail), userIdentifierSource: "FIRST_PARTY" });
  if (tel) identifiers.push({ hashedPhoneNumber: sha256(tel), userIdentifierSource: "FIRST_PARTY" });
  return identifiers;
}

function oneClick(clicks: ClickIds): { gclid: string } | { gbraid: string } | { wbraid: string } | null {
  if (clicks.gclid) return { gclid: clicks.gclid };
  if (clicks.gbraid) return { gbraid: clicks.gbraid };
  if (clicks.wbraid) return { wbraid: clicks.wbraid };
  return null;
}

function digits(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatAdsTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+00:00`;
}
