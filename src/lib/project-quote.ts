import { cleanClickIds } from "@/lib/tracking/clicks";

/** Live CF7 8575 (contact). Op /projecten staat alleen het kortingsformulier. */
export const PROJECT_QUOTE_SOURCE = "Offerte formulier /projecten";

export const PROJECT_QUOTE_EVENT = {
  event: "lead_submit",
  form_name: "Offerte formulier",
  form_location: "/projecten",
} as const;

export const PROJECT_MONTAGE_OPTIONS = ["Met montage", "Alleen materiaal"] as const;

export const PROJECT_HOUSE_PARTS = ["Gevel", "Dakrand", "Kozijnen", "Isolatie"] as const;

export const PROJECT_MONTHS = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
] as const;

export const PROJECT_UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export const PROJECT_CLICK_KEYS = ["gclid", "gbraid", "wbraid"] as const;

export const PROJECT_ATTRIBUTION_KEYS = [...PROJECT_UTM_KEYS, ...PROJECT_CLICK_KEYS] as const;

export const PROJECT_QUOTE_MAX_FILES = 3;
export const PROJECT_QUOTE_MAX_BYTES = 10 * 1024 * 1024;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export type ProjectAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

export type ProjectQuoteInput = {
  email: string;
  bedrijfsnaam: string;
  voornaam: string;
  achternaam: string;
  telefoon: string;
  adres: string;
  plaats: string;
  montage: string[];
  delen: string[];
  maand: string;
  afmetingen: string;
  companyWebsite: string;
  attribution: ProjectAttribution;
};

export type ProjectQuoteFile = {
  name: string;
  type: string;
  size: number;
};

/** Alleen na een geslaagde verzending. Validatiefouten geven null, dus geen dataLayer-event. */
export function projectQuoteDataLayer(sent: boolean) {
  if (!sent) return null;
  return { ...PROJECT_QUOTE_EVENT };
}

export function cleanProjectQuoteReference(value: string | undefined) {
  if (!value) return "";
  return /^OF-[0-9A-Z]{4,20}$/.test(value) ? value : "";
}

export function projectQuoteName(input: Pick<ProjectQuoteInput, "voornaam" | "achternaam" | "bedrijfsnaam">) {
  const person = [input.voornaam, input.achternaam]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  return person || input.bedrijfsnaam.trim() || "Onbekend";
}

function oneLine(value: string, max: number) {
  return value.replace(/[\r\n\0]/g, " ").trim().slice(0, max);
}

function chosen(values: string[], allowed: readonly string[]) {
  const unique: string[] = [];
  for (const value of values) {
    const clean = oneLine(value, 40);
    if (!allowed.includes(clean) || unique.includes(clean)) continue;
    unique.push(clean);
  }
  return unique;
}

export function cleanProjectAttribution(raw: Record<string, string | undefined>): ProjectAttribution {
  const utm = {} as ProjectAttribution;
  for (const key of PROJECT_UTM_KEYS) {
    const value = oneLine(raw[key] ?? "", 160);
    if (!value || /[<>]/.test(value)) continue;
    utm[key] = value;
  }
  const clicks = cleanClickIds({
    gclid: raw.gclid,
    gbraid: raw.gbraid,
    wbraid: raw.wbraid,
  });
  return { ...utm, ...clicks };
}

export function validateProjectQuote(input: ProjectQuoteInput): string | null {
  const email = input.email.trim();
  if (!email) return "Vul uw e-mailadres in.";
  if (email.length > 400 || !emailRe.test(email)) return "Vul een geldig e-mailadres in.";
  if (input.bedrijfsnaam.trim().length > 400) return "Houd de bedrijfsnaam kort.";
  if (input.voornaam.trim().length > 400) return "Houd de voornaam kort.";
  if (input.achternaam.trim().length > 400) return "Houd de achternaam kort.";
  if (input.telefoon.trim().length > 40) return "Houd het telefoonnummer kort.";
  if (input.adres.trim().length > 400) return "Houd het adres kort.";
  if (input.plaats.trim().length > 400) return "Houd de plaats kort.";
  if (input.afmetingen.trim().length > 2000) return "Houd de toelichting onder 2000 tekens.";
  if (input.maand && !PROJECT_MONTHS.includes(input.maand as (typeof PROJECT_MONTHS)[number])) {
    return "Kies een maand uit de lijst.";
  }
  for (const value of input.montage) {
    if (!PROJECT_MONTAGE_OPTIONS.includes(value as (typeof PROJECT_MONTAGE_OPTIONS)[number])) {
      return "Kies materiaal, montage, of allebei.";
    }
  }
  for (const value of input.delen) {
    if (!PROJECT_HOUSE_PARTS.includes(value as (typeof PROJECT_HOUSE_PARTS)[number])) {
      return "Kies een deel van het huis uit de lijst.";
    }
  }
  return null;
}

export function projectQuoteFileAllowed(file: ProjectQuoteFile) {
  const type = file.type.toLowerCase();
  if (["image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf"].includes(type)) return true;
  return /\.(jpe?g|png|heic|heif|pdf)$/i.test(file.name);
}

export function projectQuoteFileError(files: ProjectQuoteFile[]) {
  if (files.length > PROJECT_QUOTE_MAX_FILES) return `Hooguit ${PROJECT_QUOTE_MAX_FILES} bestanden.`;
  for (const file of files) {
    if (!projectQuoteFileAllowed(file)) return "Alleen jpg, png, heic of pdf.";
    if (file.size > PROJECT_QUOTE_MAX_BYTES) return "Een bestand is te groot. Maximaal 10 MB per stuk.";
  }
  return null;
}

export function projectQuoteMail(
  input: ProjectQuoteInput,
  extras: { reference: string; photoNames: string[] },
) {
  const lines = [
    `Bron: ${PROJECT_QUOTE_SOURCE}`,
    `Referentie: ${extras.reference}`,
    `E-mail: ${input.email.trim()}`,
    `Naam onderneming: ${input.bedrijfsnaam.trim() || "-"}`,
    `Voornaam: ${input.voornaam.trim() || "-"}`,
    `Achternaam: ${input.achternaam.trim() || "-"}`,
    `Naam: ${projectQuoteName(input)}`,
    `Telefoonnummer: ${input.telefoon.trim() || "-"}`,
    `Adres: ${input.adres.trim() || "-"}`,
    `Plaats: ${input.plaats.trim() || "-"}`,
    `Offerte: ${input.montage.length ? input.montage.join(", ") : "-"}`,
    `Deel van het huis: ${input.delen.length ? input.delen.join(", ") : "-"}`,
    `Maand: ${input.maand.trim() || "-"}`,
    `Afmetingen en wensen: ${input.afmetingen.trim() || "-"}`,
    `Foto's: ${extras.photoNames.length ? extras.photoNames.join(", ") : "-"}`,
  ];
  for (const key of PROJECT_UTM_KEYS) {
    const value = input.attribution[key];
    if (value) lines.push(`${key}: ${value}`);
  }
  for (const key of PROJECT_CLICK_KEYS) {
    const value = input.attribution[key];
    if (value) lines.push(`${key}: ${value}`);
  }
  return lines;
}

export function emptyProjectQuote(raw: {
  email?: string;
  bedrijfsnaam?: string;
  voornaam?: string;
  achternaam?: string;
  telefoon?: string;
  adres?: string;
  plaats?: string;
  montage?: string[];
  delen?: string[];
  maand?: string;
  afmetingen?: string;
  companyWebsite?: string;
  attribution?: Record<string, string | undefined>;
}): ProjectQuoteInput {
  const maand = oneLine(raw.maand ?? "", 20);
  return {
    email: oneLine(raw.email ?? "", 400),
    bedrijfsnaam: oneLine(raw.bedrijfsnaam ?? "", 400),
    voornaam: oneLine(raw.voornaam ?? "", 400),
    achternaam: oneLine(raw.achternaam ?? "", 400),
    telefoon: oneLine(raw.telefoon ?? "", 40),
    adres: oneLine(raw.adres ?? "", 400),
    plaats: oneLine(raw.plaats ?? "", 400),
    montage: chosen(raw.montage ?? [], PROJECT_MONTAGE_OPTIONS),
    delen: chosen(raw.delen ?? [], PROJECT_HOUSE_PARTS),
    maand: maand === "Selecteer" ? "" : maand,
    afmetingen: (raw.afmetingen ?? "").replace(/\0/g, "").trim().slice(0, 2000),
    companyWebsite: raw.companyWebsite ?? "",
    attribution: cleanProjectAttribution(raw.attribution ?? {}),
  };
}

/** Per serverproces, zelfde venster als de staalaanvraag. */
export function rateLimitProjectQuote(ip: string, now = Date.now()) {
  const key = ip.trim() || "onbekend";
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetProjectQuoteRateLimit() {
  buckets.clear();
}
