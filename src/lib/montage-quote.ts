import { formatLengthMm, formatNlNumber, formatPrice } from "@/lib/format";

export const MONTAGE_QUOTE_KEY = "kg-montage-offerte-v1";
export const MONTAGE_QUOTE_PATH = "/offerte-montage";

export type MontageQuoteLine = {
  name: string;
  color: string;
  sku: string;
  length: string;
  qty: number;
};

export type MontageQuoteDraft = {
  areaM2: string;
  montageIncl: number;
  materialIncl: number;
  message: string;
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
  if (line.sku.trim()) parts.push(line.sku.trim());
  const length = lengthLabel(line.length);
  if (length) parts.push(length);
  parts.push(`aantal ${line.qty}`);
  return parts.join(", ");
}

export function buildMontageQuoteDraft(input: {
  areaM2: number;
  montageIncl: number;
  materialIncl: number;
  lines: MontageQuoteLine[];
}): MontageQuoteDraft {
  const areaM2 = formatNlNumber(input.areaM2, 1);
  const message = [
    `Indicatieve montageprijs: ${formatPrice(input.montageIncl)} incl. btw voor ${areaM2} m².`,
    "",
    "Winkelwagen",
    ...input.lines.map((line) => `- ${lineLabel(line)}`),
    "",
    `Materiaalsubtotaal: ${formatPrice(input.materialIncl)} incl. btw`,
  ].join("\n");
  return {
    areaM2,
    montageIncl: input.montageIncl,
    materialIncl: input.materialIncl,
    message,
  };
}

export function montageQuoteNote(draft: Pick<MontageQuoteDraft, "areaM2" | "montageIncl">) {
  return `Indicatieve montageprijs: ${formatPrice(draft.montageIncl)} incl. btw voor ${draft.areaM2} m². Dit is geen opdracht.`;
}

/** Korte cijfers altijd in de url. De toelichting alleen als die in de url past. */
export function montageQuoteHref(draft: MontageQuoteDraft) {
  const params = new URLSearchParams();
  params.set("montage", "ja");
  params.set("m2", draft.areaM2);
  params.set("prijs", String(draft.montageIncl));
  params.set("materiaal", String(draft.materialIncl));
  const base = `${MONTAGE_QUOTE_PATH}?${params.toString()}`;
  const withNote = `${base}&notitie=${encodeURIComponent(draft.message)}`;
  return withNote.length <= 1800 ? withNote : base;
}

export function saveMontageQuoteDraft(draft: MontageQuoteDraft) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(MONTAGE_QUOTE_KEY, JSON.stringify(draft));
}

function parseStored(raw: string | null): MontageQuoteDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MontageQuoteDraft>;
    if (!parsed || typeof parsed.message !== "string" || typeof parsed.areaM2 !== "string") return null;
    return {
      areaM2: parsed.areaM2,
      montageIncl: Number(parsed.montageIncl) || 0,
      materialIncl: Number(parsed.materialIncl) || 0,
      message: parsed.message,
    };
  } catch {
    return null;
  }
}

/** Url wint van een oudere sessie. Ontbreekt de toelichting in de url, dan vult de sessie die aan. */
export function readMontageQuoteRequest(search: string, storedRaw: string | null): MontageQuoteDraft | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const stored = parseStored(storedRaw);
  const areaM2 = params.get("m2") || stored?.areaM2 || "";
  const message = params.get("notitie") || stored?.message || "";
  if (!areaM2 && !message) return null;
  const prijs = Number(params.get("prijs") ?? "");
  const materiaal = Number(params.get("materiaal") ?? "");
  return {
    areaM2,
    montageIncl: Number.isFinite(prijs) && params.has("prijs") ? prijs : (stored?.montageIncl ?? 0),
    materialIncl: Number.isFinite(materiaal) && params.has("materiaal") ? materiaal : (stored?.materialIncl ?? 0),
    message,
  };
}
