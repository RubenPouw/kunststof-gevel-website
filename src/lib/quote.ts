import { frameRemovalLabel, FRAME_REMOVAL_OPTIONS } from "@/lib/montage-quote";

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
  /** Leeg of afwezig als het formulier de keuze niet toont. */
  parts?: string[];
  /** Alleen de montage-offerte. De korte offerte laat deze velden weg. */
  montageForm?: boolean;
  colour?: string;
  frameCount?: string;
  /** zelf of vraag. Afvoer is een vraag, geen belofte. */
  removal?: string;
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
    return "Vul het geveloppervlak in m² in (1 tot 2000).";
  }
  if (!(quoteProfiles as readonly string[]).includes(input.profile)) {
    return "Kies een profiel.";
  }
  if ((input.colour ?? "").trim().length > 160) return "Houd de kleur kort.";
  const kozijnen = (input.parts ?? []).includes("Kozijnen");
  if (kozijnen) {
    const count = Number(String(input.frameCount ?? "").replace(",", "."));
    if (!Number.isInteger(count) || count < 1 || count > 200) return "Vul het aantal kozijnen in.";
    if (input.removal && !FRAME_REMOVAL_OPTIONS.some((item) => item.value === input.removal)) {
      return "Kies of afvoer een vraag op de offerte is.";
    }
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
  const partsRaw = o.parts;
  const parts = Array.isArray(partsRaw)
    ? partsRaw.filter((part): part is string => typeof part === "string")
    : str("parts")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
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
    parts,
    montageForm: o.montageForm === true,
    colour: str("colour"),
    frameCount: str("frameCount"),
    removal: str("removal"),
  };
}

export function quoteDeliveryLines(
  input: QuoteInput,
  extras: { area: number; reference: string; photoNames: string[] },
) {
  const parts = (input.parts ?? []).filter(Boolean);
  const kozijnen = parts.includes("Kozijnen");
  const lines = [
    `Nieuwe offerteaanvraag ${extras.reference}`,
    `Naam: ${input.name.trim()}`,
    `E-mail: ${input.email.trim()}`,
    `Telefoon: ${input.phone.trim()}`,
    `Plaats: ${input.city.trim()}`,
    `Oppervlak: ${extras.area} m2`,
    `Profiel: ${input.profile}`,
    `${input.montageForm ? "Montage door Cavemen" : "Montage"}: ${input.wantsMontage ? "ja" : "nee"}`,
    `Waar gaat het om: ${parts.length ? parts.join(", ") : "-"}`,
  ];
  if (input.montageForm) {
    lines.push(`Kleur: ${input.colour?.trim() || "-"}`);
    lines.push(`Aantal kozijnen: ${kozijnen ? input.frameCount?.trim() || "-" : "-"}`);
    if (kozijnen) {
      lines.push("Inmeten: klant meet zelf");
      lines.push(`Afvoer oud kozijn: ${frameRemovalLabel(input.removal) || "-"}`);
    }
  }
  lines.push(`Foto's: ${extras.photoNames.length ? extras.photoNames.join(", ") : "-"}`);
  lines.push(`Bericht: ${input.message.trim() || "-"}`);
  return lines;
}
