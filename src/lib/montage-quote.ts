import { formatLengthMm, formatNlNumber, formatPrice } from "@/lib/format";

export const MONTAGE_QUOTE_KEY = "kg-montage-offerte-v1";
export const MONTAGE_QUOTE_PATH = "/offerte-montage";

export const MONTAGE_PARTS = ["Dakrand", "Gevel", "Isolatie", "Kozijnen"] as const;
export type MontagePart = (typeof MONTAGE_PARTS)[number];

export type MontageQuoteLine = {
  name: string;
  color: string;
  sku: string;
  length: string;
  qty: number;
  kind?: "product" | "kozijn";
};

export type MontageQuoteDraft = {
  areaM2: string;
  montageIncl: number;
  materialIncl: number;
  message: string;
  parts: MontagePart[];
};

function lengthLabel(length: string) {
  const trimmed = length.trim();
  if (!trimmed) return "";
  if (/^\d{1,3}(?:\.\d{3})+\s*mm$/i.test(trimmed)) return trimmed;
  return formatLengthMm(trimmed);
}

function lineLabel(line: MontageQuoteLine) {
  const parts = [line.name.trim()];
  if (line.color.trim()) parts.push(line.color.trim());
  const length = lengthLabel(line.length);
  if (length) parts.push(length);
  const unit = line.qty === 1 ? "stuk" : "stuks";
  parts.push(`${line.qty} ${unit}`);
  return parts.join(", ");
}

export function montagePartForLine(line: Pick<MontageQuoteLine, "name" | "kind">): MontagePart | null {
  const text = line.name.toLowerCase();
  if (line.kind === "kozijn" || /\bkozijn|\braam\b|\bdeur\b/.test(text)) return "Kozijnen";
  if (/dakrand|boeideel|\bboei\b/.test(text)) return "Dakrand";
  if (/isolatie/.test(text)) return "Isolatie";
  if (/gevel|sponning|rabat|potdeksel|quattro|rondkant|paneel/.test(text)) return "Gevel";
  return null;
}

export function montagePartsForLines(lines: Pick<MontageQuoteLine, "name" | "kind">[]): MontagePart[] {
  const found = new Set<MontagePart>();
  for (const line of lines) {
    const part = montagePartForLine(line);
    if (part) found.add(part);
  }
  return MONTAGE_PARTS.filter((part) => found.has(part));
}

export function buildMontageQuoteDraft(input: {
  areaM2: number;
  montageIncl: number;
  materialIncl: number;
  lines: MontageQuoteLine[];
}): MontageQuoteDraft {
  const areaM2 = formatNlNumber(input.areaM2, 1);
  const message = [
    ...input.lines.map((line) => lineLabel(line)),
    "",
    `Totaal: ${areaM2} m²`,
    `Indicatieve montageprijs: ${formatPrice(input.montageIncl)} incl. btw`,
    `Materiaalsubtotaal: ${formatPrice(input.materialIncl)} incl. btw`,
  ].join("\n");
  return {
    areaM2,
    montageIncl: input.montageIncl,
    materialIncl: input.materialIncl,
    message,
    parts: montagePartsForLines(input.lines),
  };
}

export function montageQuoteNote(draft: Pick<MontageQuoteDraft, "areaM2" | "montageIncl">) {
  return `Indicatieve montageprijs: ${formatPrice(draft.montageIncl)} incl. btw voor ${draft.areaM2} m². Dit is geen opdracht.`;
}

/**
 * Korte url. De notities staan in localStorage, niet in de query:
 * een echte winkelwagen maakt `notitie` langer dan de url aankan, en dan blijft het veld leeg.
 */
export function montageQuoteHref(draft: MontageQuoteDraft) {
  const params = new URLSearchParams();
  params.set("van", "winkelwagen");
  params.set("montage", "ja");
  params.set("m2", draft.areaM2);
  params.set("prijs", String(draft.montageIncl));
  params.set("materiaal", String(draft.materialIncl));
  if (draft.parts.length) params.set("delen", draft.parts.join(","));
  return `${MONTAGE_QUOTE_PATH}?${params.toString()}`;
}

export function saveMontageQuoteDraft(draft: MontageQuoteDraft) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(draft);
  window.localStorage.setItem(MONTAGE_QUOTE_KEY, raw);
  window.sessionStorage.setItem(MONTAGE_QUOTE_KEY, raw);
}

function parseStored(raw: string | null): MontageQuoteDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MontageQuoteDraft>;
    if (!parsed || typeof parsed.message !== "string" || typeof parsed.areaM2 !== "string") return null;
    const parts = Array.isArray(parsed.parts)
      ? parsed.parts.filter((part): part is MontagePart => (MONTAGE_PARTS as readonly string[]).includes(String(part)))
      : [];
    return {
      areaM2: parsed.areaM2,
      montageIncl: Number(parsed.montageIncl) || 0,
      materialIncl: Number(parsed.materialIncl) || 0,
      message: parsed.message,
      parts,
    };
  } catch {
    return null;
  }
}

function partsFromParam(value: string | null): MontagePart[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is MontagePart => (MONTAGE_PARTS as readonly string[]).includes(part));
}

/** Opgeslagen notities gaan voor. De url houdt alleen de korte cijfers, tenzij een oude link nog `notitie` heeft. */
export function readMontageQuoteRequest(search: string, storedRaw: string | null): MontageQuoteDraft | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const stored = parseStored(storedRaw);
  const fromCart = params.get("van") === "winkelwagen";
  const areaM2 = params.get("m2") || stored?.areaM2 || "";
  const message = (fromCart ? stored?.message : "") || params.get("notitie") || stored?.message || "";
  if (!areaM2 && !message && !fromCart) return null;
  const prijs = Number(params.get("prijs") ?? "");
  const materiaal = Number(params.get("materiaal") ?? "");
  const parts = partsFromParam(params.get("delen"));
  return {
    areaM2,
    montageIncl: Number.isFinite(prijs) && params.has("prijs") ? prijs : (stored?.montageIncl ?? 0),
    materialIncl: Number.isFinite(materiaal) && params.has("materiaal") ? materiaal : (stored?.materialIncl ?? 0),
    message,
    parts: parts.length ? parts : (stored?.parts ?? []),
  };
}
