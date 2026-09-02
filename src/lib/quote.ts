export const quoteProfiles = [
  "Nog niet zeker",
  "Rabat",
  "Sponningdeel",
  "Potdeksel",
  "Zweeds rabat",
] as const;

export type QuoteInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  areaM2: string;
  profile: string;
  message: string;
};

export type QuoteResult =
  | { ok: true; reference: string; estimate: { low: number; high: number; area: number } }
  | { ok: false; error: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateQuote(input: QuoteInput): string | null {
  if (input.name.trim().length < 2) return "Vul je naam in.";
  if (!emailRe.test(input.email.trim())) return "Vul een geldig e-mailadres in.";
  if (input.phone.replace(/\s/g, "").length < 10) return "Vul een geldig telefoonnummer in.";
  if (input.city.trim().length < 2) return "Vul je plaats in.";
  const area = Number(input.areaM2.replace(",", "."));
  if (!Number.isFinite(area) || area < 1 || area > 2000) {
    return "Vul het geveloppervlak in m² in (1–2000).";
  }
  return null;
}

export function estimateRange(areaM2: number) {
  return {
    area: areaM2,
    low: Math.round(areaM2 * 95),
    high: Math.round(areaM2 * 140),
  };
}

export function parseQuoteBody(raw: unknown): QuoteInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    city: str("city"),
    areaM2: str("areaM2"),
    profile: str("profile"),
    message: str("message"),
  };
}
