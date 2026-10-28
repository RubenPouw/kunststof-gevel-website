import type { Metadata } from "next";

import { slugKey } from "@/lib/catalog/derive";
import { colorFamilies, colorFamilyLabels, type ColorFamily, type Product } from "@/lib/catalog/types";

export const HPL_HUB_PATH = "/hpl-plaat";
export const HPL_HUB_ALIAS = "/hpl-plaat/kleur-structuur";

export const HPL_HUB_TITLE = "HPL plaat op kleur";
export const HPL_HUB_DESCRIPTION =
  "HPL Compact Exterieur, Renolit eenzijdig en Milyt. Hele plaat 3050 × 1300 mm, 3,965 m². Kies een kleur of een decor. Wij zagen niet op maat.";

export const hplLineOrder = ["compact", "fr", "renolit", "milyt", "abet"] as const;

export type HplAfwerking = "ral" | "decor";

export type HplOnderdeel = "platen" | "overig";

export type HplHubQuery = {
  colors: string[];
  lines: string[];
  afwerking?: HplAfwerking;
  onderdeel: HplOnderdeel;
};

export type HplCard = {
  key: string;
  href: string;
  slug: string;
  line: string;
  lineLabel: string;
  colorName: string;
  ral?: string;
  family: ColorFamily;
  hex: string;
  price: number;
  sheetM2?: number;
  image?: Product["images"][number];
  afwerking: HplAfwerking | "uni";
  inStock: boolean;
};

const COLOR_ALIASES: Record<string, string> = {
  cortensteel: "corten",
  cortenstaal: "corten",
  corten: "corten",
  red: "rood",
  rood: "rood",
  anthracite: "antraciet",
  anthraciet: "antraciet",
  antraciet: "antraciet",
  black: "zwart",
  zwart: "zwart",
  white: "wit",
  wit: "wit",
  grey: "grijs",
  gray: "grijs",
  grijs: "grijs",
  green: "groen",
  groen: "groen",
  blue: "blauw",
  blauw: "blauw",
  brown: "bruin",
  bruin: "bruin",
  yellow: "geel",
  geel: "geel",
  orange: "oranje",
  oranje: "oranje",
  cream: "creme",
  creme: "creme",
  betonlook: "beton",
  beton: "beton",
  zinklook: "zink",
  zink: "zink",
  whitewash: "whitewash",
  kalksteen: "kalksteen",
};

const LINE_ALIASES: Record<string, string> = {
  compact: "compact",
  "compact-exterieur": "compact",
  "hpl-compact-exterieur": "compact",
  fr: "fr",
  brandvertragend: "fr",
  "hpl-fr": "fr",
  renolit: "renolit",
  "renolit-eenzijdig": "renolit",
  milyt: "milyt",
  abet: "abet",
};

const COLOR_LABELS: Record<string, string> = {
  corten: "Cortenstaal",
  antraciet: "Antraciet",
  zwart: "Zwart",
  wit: "Wit",
  grijs: "Grijs",
  oranje: "Oranje",
  creme: "Crème",
  beton: "Betonlook",
  zink: "Zinklook",
  whitewash: "Whitewash",
  kalksteen: "Kalksteen",
};

const LINE_LABELS: Record<string, string> = {
  compact: "Compact Exterieur",
  fr: "FR brandvertragend",
  renolit: "Renolit eenzijdig",
  milyt: "Milyt",
  abet: "Abet",
};

const GENERIC_COLOR = /^(milyt|hpl|standaard|default title|hpl plaat)?$/i;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function splitCsv(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function flatKey(value: string) {
  return slugKey(value).replace(/-/g, "");
}

/** Competitor-style tokens (`cortensteel`, `red`) and Dutch names land on one key. */
export function canonHplColorToken(raw: string) {
  const key = slugKey(raw);
  return COLOR_ALIASES[key] ?? COLOR_ALIASES[flatKey(raw)] ?? key;
}

export function canonHplLine(raw: string) {
  const key = slugKey(raw);
  return LINE_ALIASES[key] ?? key;
}

export function hplLineLabel(id: string) {
  return LINE_LABELS[id] ?? id;
}

export function hplColorTokenLabel(token: string) {
  if ((colorFamilies as readonly string[]).includes(token)) return colorFamilyLabels[token as ColorFamily];
  return COLOR_LABELS[token] ?? token;
}

export function tidyHplColorName(name: string) {
  return name
    .replace(/\bmm\b/gi, " ")
    .replace(/\bdefault\s+title\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function hplLineOf(product: Pick<Product, "name" | "brand" | "brandSlug" | "category">): {
  id: string;
  label: string;
} | null {
  const blob = `${product.name} ${product.brand} ${product.brandSlug}`;
  if (/\bmilyt\b/i.test(blob)) return { id: "milyt", label: LINE_LABELS.milyt };
  if (/\brenolit\b/i.test(blob) || product.brandSlug === "renolit") {
    return { id: "renolit", label: LINE_LABELS.renolit };
  }
  if (/\babet\b/i.test(blob) || product.brandSlug === "abet") return { id: "abet", label: LINE_LABELS.abet };
  if (/brandvertragend|\bhpl[-\s]?fr\b|\bfr\b/i.test(product.name)) {
    return { id: "fr", label: LINE_LABELS.fr };
  }
  if (/compact\s+exterieur/i.test(blob) || product.brandSlug === "hpl-compact-exterieur") {
    return { id: "compact", label: LINE_LABELS.compact };
  }
  if (product.category === "hpl-platen") {
    return { id: product.brandSlug || "hpl", label: product.brand || "HPL" };
  }
  return null;
}

function afwerkingOf(colorName: string, productName: string, ral?: string): HplCard["afwerking"] {
  if (ral) return "ral";
  if (/decor|look/i.test(`${productName} ${colorName}`)) return "decor";
  return "uni";
}

function isGenericColor(name: string) {
  return GENERIC_COLOR.test(name.trim().toLowerCase());
}

/** One card per colour. Exterior sheets only: the `hpl-platen` category, whole 6 mm plates. */
export function hplColorCards(products: Product[]): HplCard[] {
  const cards: HplCard[] = [];
  for (const product of products) {
    if (product.category !== "hpl-platen") continue;
    if (/sandwich|reiniger/i.test(product.name)) continue;
    const line = hplLineOf(product);
    if (!line) continue;
    const colors = product.colors.length
      ? product.colors
      : product.variants.map((variant) => ({
          name: variant.colorName,
          hex: variant.hex,
          ral: variant.ral,
          family: variant.colorFamily,
          sampleId: variant.sampleId,
        }));
    for (const color of colors) {
      const colorName = tidyHplColorName(color.name);
      const variant =
        product.variants.find((item) => item.colorName === color.name) ??
        product.variants.find((item) => tidyHplColorName(item.colorName) === colorName);
      const price = variant?.price ?? product.price;
      if (isGenericColor(colorName)) continue;
      cards.push({
        key: `${product.slug}:${slugKey(colorName)}`,
        href: `/producten/${product.slug}`,
        slug: product.slug,
        line: line.id,
        lineLabel: line.label,
        colorName,
        ral: color.ral,
        family: color.family,
        hex: color.hex,
        price,
        sheetM2: product.sheetM2,
        image: variant?.image,
        afwerking: afwerkingOf(colorName, product.name, color.ral),
        inStock: variant?.inStock ?? product.inStock,
      });
    }
  }
  return cards.sort((a, b) => {
    const family = colorFamilies.indexOf(a.family) - colorFamilies.indexOf(b.family);
    if (family) return family;
    const name = a.colorName.localeCompare(b.colorName, "nl");
    if (name) return name;
    return a.lineLabel.localeCompare(b.lineLabel, "nl") || a.slug.localeCompare(b.slug);
  });
}

/** Sandwich, cleaner and the thin 2 mm sheet. Not the exterior colour wall. */
export function hplRelatedProducts(products: Product[]) {
  return products
    .filter((product) => {
      if (product.category === "hpl-platen") return false;
      const blob = `${product.name} ${product.slug}`.toLowerCase();
      if (!blob.includes("hpl")) return false;
      return /sandwich|reiniger|1150|2\s*mm|2mm/.test(blob);
    })
    .sort((a, b) => a.name.localeCompare(b.name, "nl") || a.slug.localeCompare(b.slug));
}

function colorText(card: HplCard) {
  return `${card.colorName} ${card.ral ?? ""}`.toLocaleLowerCase("nl");
}

export function cardMatchesColorToken(card: HplCard, token: string) {
  const canon = canonHplColorToken(token);
  const text = colorText(card);
  if (canon === "corten") return text.includes("corten");
  if (canon === "rood") return card.family === "rood" || text.includes("rood");
  if (canon === "antraciet") return text.includes("antraciet");
  if (canon === "zwart") return text.includes("zwart");
  if (canon === "wit") return text.includes("wit");
  if (canon === "grijs") return text.includes("grijs");
  if (canon === "groen") return card.family === "groen" || text.includes("groen");
  if (canon === "blauw") return card.family === "blauw" || text.includes("blauw");
  if (canon === "bruin") return card.family === "bruin" || text.includes("bruin");
  if (canon === "geel") return card.family === "geel" || text.includes("geel");
  if (canon === "oranje") return text.includes("oranje");
  if (canon === "creme") return /cr[eè]me/.test(text);
  if (canon === "beton") return text.includes("beton");
  if (canon === "zink") return text.includes("zink");
  if (canon === "whitewash") return text.includes("whitewash");
  if (canon === "kalksteen") return text.includes("kalksteen");
  if ((colorFamilies as readonly string[]).includes(canon)) return card.family === canon;
  const needle = flatKey(canon);
  if (needle.length < 2) return false;
  return flatKey(text).includes(needle);
}

export function filterHplCards(cards: HplCard[], query: HplHubQuery) {
  return cards.filter((card) => {
    if (query.lines.length && !query.lines.includes(card.line)) return false;
    if (query.afwerking && card.afwerking !== query.afwerking) return false;
    if (query.colors.length && !query.colors.some((token) => cardMatchesColorToken(card, token))) return false;
    return true;
  });
}

export function parseHplHubSearch(
  params: Record<string, string | string[] | undefined>,
): HplHubQuery {
  const colors: string[] = [];
  for (const part of splitCsv(firstParam(params.color))) {
    const canon = canonHplColorToken(part);
    if (canon && !colors.includes(canon)) colors.push(canon);
  }
  const lines: string[] = [];
  for (const part of splitCsv(firstParam(params.lijn))) {
    const canon = canonHplLine(part);
    if (canon && !lines.includes(canon)) lines.push(canon);
  }
  const afwerkingRaw = firstParam(params.afwerking);
  const afwerking = afwerkingRaw === "ral" || afwerkingRaw === "decor" ? afwerkingRaw : undefined;
  const onderdeel = firstParam(params.onderdeel) === "overig" ? "overig" : "platen";
  return { colors, lines, afwerking, onderdeel };
}

export function hasHplHubFilters(query: HplHubQuery) {
  return Boolean(query.colors.length || query.lines.length || query.afwerking || query.onderdeel === "overig");
}

export function hplHubHref(basePath: string, query: HplHubQuery) {
  const parts: string[] = [];
  if (query.onderdeel === "overig") parts.push("onderdeel=overig");
  if (query.lines.length) parts.push(`lijn=${query.lines.join(",")}`);
  if (query.afwerking) parts.push(`afwerking=${query.afwerking}`);
  if (query.colors.length) parts.push(`color=${query.colors.join(",")}`);
  return parts.length ? `${basePath}?${parts.join("&")}` : basePath;
}

export function hplHubMetadata(query: HplHubQuery, options?: { alias?: boolean }): Metadata {
  return {
    title: HPL_HUB_TITLE,
    description: HPL_HUB_DESCRIPTION,
    alternates: { canonical: HPL_HUB_PATH },
    robots: options?.alias || hasHplHubFilters(query) ? { index: false, follow: true } : undefined,
  };
}
