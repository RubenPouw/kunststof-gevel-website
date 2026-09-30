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
  wantsMontage: boolean;
  companyWebsite: string;
};

export type QuoteEstimate = {
  low: number;
  high: number;
  area: number;
  montage: boolean;
};

export type QuoteResult =
  | { ok: true; reference: string; estimate: QuoteEstimate }
  | { ok: false; error: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateQuote(input: QuoteInput): string | null {
  if (input.name.trim().length < 2) return "Vul uw naam in.";
  if (!emailRe.test(input.email.trim())) return "Vul een geldig e-mailadres in.";
  if (input.phone.replace(/\s/g, "").length < 10) return "Vul een geldig telefoonnummer in.";
  if (input.city.trim().length < 2) return "Vul uw plaats in.";
  const area = Number(input.areaM2.replace(",", "."));
  if (!Number.isFinite(area) || area < 1 || area > 2000) {
    return "Vul het geveloppervlak in m² in (1–2000).";
  }
  if (!(quoteProfiles as readonly string[]).includes(input.profile)) {
    return "Kies een profiel.";
  }
  return null;
}

export function estimateRange(areaM2: number, montage = true): QuoteEstimate {
  const lowRate = montage ? 95 : 65;
  const highRate = montage ? 140 : 120;
  return {
    area: areaM2,
    montage,
    low: Math.round(areaM2 * lowRate),
    high: Math.round(areaM2 * highRate),
  };
}

export function parseQuoteBody(raw: unknown): QuoteInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
  const montageRaw = o.wantsMontage;
  const wantsMontage =
    montageRaw === false || montageRaw === "nee" || montageRaw === "0" ? false : true;
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    city: str("city"),
    areaM2: str("areaM2"),
    profile: str("profile") || "Nog niet zeker",
    message: str("message"),
    wantsMontage,
    companyWebsite: str("companyWebsite"),
  };
}
