/** Pure catalog text rules. No imports, so scripts can load this file directly. */

export const DISTRIBUTOR_BRAND_SLUGS = new Set(["heering", "milin"]);

const PRODUCT_LINES: { slug: string; re: RegExp }[] = [
  { slug: "milinboard", re: /\bmilinboard\b/i },
  { slug: "vinytherm", re: /\bvinytherm\b/i },
  { slug: "vinyplus", re: /\bviny\s?plus\b/i },
  { slug: "kerrafront", re: /\bkerrafront\b/i },
  { slug: "keralit", re: /\bkeralit\b/i },
  { slug: "eurotexx", re: /\beurotexx\b/i },
  { slug: "zierer", re: /\bzierer\b/i },
  { slug: "milexx", re: /\bmilexx\b/i },
  { slug: "profex", re: /\b(?:profex|duafort)\b/i },
  { slug: "unipanel", re: /\bunipanel\b/i },
  { slug: "florence", re: /\bflorence\b/i },
  { slug: "linerio", re: /\blinerio\b/i },
  { slug: "fronto", re: /\bfronto\b/i },
  { slug: "werzalit", re: /\bwerzalit\b/i },
  { slug: "thomdeck", re: /\bthomdeck\b/i },
  { slug: "multitexx", re: /\bmultitexx\b/i },
  { slug: "heering", re: /\bheering\b/i },
  { slug: "milin", re: /\bmilin\b/i },
];

export function matchProductLine(text: string): string | undefined {
  for (const line of PRODUCT_LINES) {
    if (line.re.test(text)) return line.slug;
  }
  return undefined;
}

export function hasPurchasePrice(price: number) {
  return Number.isFinite(price) && price > 0;
}

export function canonicalHandle(handle: string) {
  return handle.replace(/-(\d+)$/, "");
}

export function normalizeProductName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Strip supplier boilerplate. The shop brand stays, the groothandel not. */
export function sanitizeDescription(description: string, title: string) {
  let text = description.replace(/\s+/g, " ").trim();
  text = text
    .replace(/onderdeel van het heering-assortiment bij aj fust\.?/gi, "")
    .replace(/leverbaar via aj fust\.?/gi, "")
    .replace(/\bbij aj fust\b/gi, "")
    .replace(/\baj fust\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();

  if (text.length < 24) return `${title}.`;
  return text;
}

export function parseLengthMeters(length: string): number | undefined {
  const value = length.trim().toLowerCase().replace(/\s+/g, " ");
  const match = value.match(/^(\d+(?:[.,]\d+)?)\s*(m|meter|mtr)\b/);
  if (!match) return undefined;
  const meters = Number(match[1].replace(",", "."));
  if (!Number.isFinite(meters) || meters < 0.5 || meters > 12) return undefined;
  return meters;
}

function formatMeters(meters: number) {
  const rounded = Math.round(meters * 100) / 100;
  if (Number.isInteger(rounded)) return `${rounded} m`;
  return `${String(rounded).replace(".", ",")} m`;
}

/**
 * Panel length from a title or variant label.
 * 600 cm and 6 m are lengths. 143 mm is a width and is ignored.
 */
export function extractPanelLength(text: string): string | undefined {
  const cm = text.match(/(\d+(?:[.,]\d+)?)\s*cm\b/i);
  if (cm) {
    const n = Number(cm[1].replace(",", "."));
    if (n >= 80 && n <= 1200) return formatMeters(n / 100);
  }

  const meters = text.match(/(\d+(?:[.,]\d+)?)\s*(?:mtr|meter|m)\b/i);
  if (meters) {
    const n = Number(meters[1].replace(",", "."));
    if (n >= 0.5 && n <= 12) return formatMeters(n);
  }

  const labelledMm = text.match(/(?:lengte|length)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*mm\b/i);
  if (labelledMm) {
    const n = Number(labelledMm[1].replace(",", "."));
    if (n >= 800 && n <= 12000) return formatMeters(n / 1000);
  }

  return undefined;
}

export function splitColorAndLength(label: string): { colorName: string; length?: string } {
  const length = extractPanelLength(label);
  if (!length) return { colorName: label.trim() || "Standaard" };

  const colorName = label
    .replace(/(\d+(?:[.,]\d+)?)\s*cm\b/gi, "")
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:mtr|meter|m)\b/gi, "")
    .replace(/\s*[|/,-]+\s*$/g, "")
    .replace(/^\s*[|/,-]+\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+[|/,-]\s*$/g, "")
    .trim();

  return { colorName: colorName || "Standaard", length };
}
