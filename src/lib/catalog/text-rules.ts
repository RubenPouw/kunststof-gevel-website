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

/** Shopify adds `-1` when a handle already exists. A width such as `-167` stays part of the handle. */
export function canonicalHandle(handle: string) {
  return handle.replace(/-1$/, "");
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
/** Remove a laminate brand we do not sell. Customer-facing text must not keep the name. */
export function withoutTrespa(text: string) {
  return text
    .replace(/\btrespa\b/gi, "HPL")
    .replace(/\bHPL(?:\s+HPL)+\b/g, "HPL")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

const HPL_LINES: { slug: string; re: RegExp }[] = [
  { slug: "hpl-compact-exterieur", re: /compact\s+exterieur/i },
  { slug: "renolit", re: /renolit/i },
  { slug: "abet", re: /\babet\b/i },
  { slug: "hpl-fr", re: /brandvertragend|\bhpl[-\s]?fr\b|\bfr\b/i },
];

export function matchHplLine(text: string): string | undefined {
  for (const line of HPL_LINES) {
    if (line.re.test(text)) return line.slug;
  }
  return undefined;
}

/** Compact sheet, not a sandwich panel, a cleaner, or a thinner offcut. */
export function isHplSheetText(text: string) {
  const value = text.toLowerCase();
  if (/sandwich|reiniger/.test(value)) return false;
  if (/1150|2\s*mm|24\s*mm/.test(value)) return false;
  return /\bhpl\b/.test(value) && /plaat/.test(value);
}

export function extractRal(text: string): string | undefined {
  const match = text.match(/\bRAL\s*([0-9]{4})\b/i);
  return match ? `RAL ${match[1]}` : undefined;
}

/** Colour name and RAL from an HPL title, with the line name and the sheet size removed. */
export function extractHplColor(text: string): { colorName?: string; ral?: string } {
  const ral = extractRal(text);
  const colorName = text
    .replace(/\bHPL\b/gi, " ")
    .replace(/compact\s+exterieur/gi, " ")
    .replace(/brandvertragend/gi, " ")
    .replace(/\brenolit\b/gi, " ")
    .replace(/eenzijdig/gi, " ")
    .replace(/\babet\b/gi, " ")
    .replace(/\bfr\b/gi, " ")
    .replace(/\bplaat(?:en)?\b/gi, " ")
    .replace(/\b(kleur|color|colour|ral)\b/gi, " ")
    .replace(/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?/gi, " ")
    .replace(/\d+(?:[.,]\d+)?\s*mm\b/gi, " ")
    .replace(/\bmm\b/gi, " ")
    .replace(/\bdefault\s+title\b/gi, " ")
    .replace(/\bRAL\s*[0-9]{4}\b/gi, " ")
    .replace(/[^A-Za-zÀ-ÿ -]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const unique = [...new Set(colorName.split(" ").filter(Boolean))];
  return { colorName: unique.join(" ") || undefined, ral };
}

export function sanitizeDescription(description: string, title: string) {
  let text = withoutTrespa(description).replace(/\s+/g, " ").trim();
  text = text
    .replace(/onderdeel van het heering-assortiment bij aj fust\.?/gi, "")
    .replace(/leverbaar via aj fust\.?/gi, "")
    .replace(/\bbij aj fust\b/gi, "")
    .replace(/\baj fust\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();

  if (text.length < 24 || text.toLowerCase() === withoutTrespa(title).toLowerCase()) return "";
  return withoutTrespa(text);
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
