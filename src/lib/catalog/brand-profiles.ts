import { isHplSheetText, normalizeProductName, parseLengthMeters } from "@/lib/catalog/text-rules";
import { isBannedSampleProduct } from "@/lib/staal/banned";
import type { Product, ProductVariant } from "@/lib/catalog/types";

/** Cards in the block. More panel models stay in the listing below. */
export const PROFILE_CARD_LIMIT = 6;

export const BRAND_PROFILE_COPY = {
  title: "Kies je profiel",
  lead: "De prijs is de totaalprijs van de hele lengte, incl. btw.",
  sheetLead: "De prijs is de totaalprijs van de hele plaat, incl. btw.",
  view: "Bekijk product",
  sample: "Vraag een staal aan",
  onRequest: "Prijs op aanvraag",
  all: "Bekijk alle panelen",
} as const;

/**
 * These lines stay off the block even when a product row still exists.
 * Profex is not in this list: it shows only when the catalog has panels.
 */
const BLOCKED_BRAND = /duafort|canexel|linerio|wonderboard/i;

const FAMILY_RANK: { test: RegExp; rank: number }[] = [
  { test: /\bquattro\b/i, rank: 0 },
  { test: /\bvario\b/i, rank: 1 },
  { test: /rondkant/i, rank: 2 },
  { test: /rabat/i, rank: 3 },
  { test: /sponning/i, rank: 4 },
  { test: /potdeksel/i, rank: 5 },
  { test: /velling/i, rank: 6 },
  { test: /steenstrip|leisteen/i, rank: 7 },
];

/** Main sheet colours first when a line is one plate in many colours. */
const SHEET_COLOR_RANK = [
  "antraciet",
  "7016",
  "verkeerswit",
  "9016",
  "zuiver wit",
  "9010",
  "zwart",
  "9005",
  "crème",
  "creme",
  "9001",
  "beton",
  "whitewash",
  "wit",
];

export type BrandProfilePick = {
  products: Product[];
  total: number;
  hasMore: boolean;
  /** Every chosen model is an HPL sheet, so the caption talks about a plate. */
  sheets: boolean;
};

const EMPTY_PICK: BrandProfilePick = { products: [], total: 0, hasMore: false, sheets: false };

export function isProfileBrandBlocked(slug: string, name = "") {
  return BLOCKED_BRAND.test(`${slug} ${name}`.replace(/-/g, " "));
}

function hiddenName(product: Product) {
  return isBannedSampleProduct(product) || /\beko\b/i.test(`${product.slug} ${product.name} ${product.brand} ${product.vendor}`);
}

export function isHplSheetCard(product: Product) {
  if (product.productGroup === "afwerkprofiel" || product.productGroup === "toebehoren") return false;
  if (product.category !== "hpl-platen" || product.saleUnit !== "sheet") return false;
  if (/sandwich|reiniger|1150|2\s*mm|24\s*mm/i.test(product.name)) return false;
  return isHplSheetText(product.name) || /plaat/i.test(product.name);
}

/** Facade panel or steenstrip. Dakrand, plafond, profiles and screws stay out. */
export function isFacadePanelCard(product: Product) {
  if (product.saleUnit === "sheet" || product.category !== "gevelbekleding") return false;
  if (product.productGroup !== "gevelpaneel") return false;
  if (/dakrand|boeideel|plafond/i.test(product.name)) return false;
  return true;
}

export function isProfileCardProduct(product: Product) {
  if (hiddenName(product) || isProfileBrandBlocked(product.brandSlug, product.brand)) return false;
  return isFacadePanelCard(product) || isHplSheetCard(product);
}

/** Metres of a stored length. 150 mm is a width and stays out. */
export function lengthMeters(length: string | undefined): number | undefined {
  if (!length) return undefined;
  const meters = parseLengthMeters(length);
  if (meters) return meters;
  const cm = length.trim().match(/^(\d+(?:[.,]\d+)?)\s*cm$/i);
  if (cm) {
    const value = Number(cm[1].replace(",", "."));
    if (value >= 80 && value <= 1200) return value / 100;
  }
  const mm = length.trim().match(/^(\d+(?:[.,]\d+)?)\s*mm$/i);
  if (!mm) return undefined;
  const value = Number(mm[1].replace(",", "."));
  if (value >= 800 && value <= 12000) return value / 1000;
  return undefined;
}

export function lengthCaption(length: string | undefined, vat: "incl" | "excl"): string {
  const raw = length?.trim();
  if (raw && /\d\s*[x×]\s*\d/i.test(raw)) return `Per plaat van ${raw}, ${vat}. btw`;
  const meters = lengthMeters(raw);
  if (!meters) return `Prijs is de hele productlengte, ${vat}. btw`;
  const cmExact = meters * 100;
  const cm = Math.abs(cmExact - Math.round(cmExact)) < 0.05 ? Math.round(cmExact) : Math.round(cmExact * 10) / 10;
  return `Per lengte van ${cm.toLocaleString("nl-NL")} cm, ${vat}. btw`;
}

export function widthLabel(product: Product): string | null {
  if (!product.workingWidthMm || product.saleUnit === "sheet") return null;
  return `Werkende breedte ${product.workingWidthMm} mm`;
}

/**
 * Price of one full length, incl. btw, from the catalog variant.
 * The amount is the stored price of the longest length, never a per-metre rate
 * and never a fixed figure. A shorter length is ignored, even when it is cheaper.
 */
export function lengthOffer(product: Product): { incl: number; length: string; variant: ProductVariant } | null {
  const priced = product.variants.filter((variant) => variant.price > 0);
  const withLength = priced.filter((variant) => lengthMeters(variant.length));
  const pool = withLength.length ? withLength : priced;
  if (!pool.length) return null;
  const longest = Math.max(...pool.map((variant) => lengthMeters(variant.length) ?? 0));
  const atLength = longest > 0 ? pool.filter((variant) => lengthMeters(variant.length) === longest) : pool;
  const variant = atLength.reduce((best, item) => (item.price < best.price ? item : best));
  return { incl: variant.price, length: variant.length, variant };
}

function familyRank(product: Product) {
  if (isHplSheetCard(product)) return 8;
  const text = `${product.name} ${product.profileType}`;
  for (const item of FAMILY_RANK) {
    if (item.test.test(text)) return item.rank;
  }
  return 9;
}

function sheetColorRank(product: Product) {
  const text = product.name.toLowerCase();
  const variantLine = /\bbrandvertragend\b|\bfr\b/.test(text) ? 50 : 0;
  for (let index = 0; index < SHEET_COLOR_RANK.length; index += 1) {
    if (text.includes(SHEET_COLOR_RANK[index])) return variantLine + index;
  }
  return variantLine + SHEET_COLOR_RANK.length;
}

function colorCount(product: Product) {
  const names = new Set(product.variants.filter((variant) => variant.price > 0).map((variant) => variant.colorName));
  return names.size;
}

function preferPanel(next: Product, current: Product) {
  const nextPrice = next.variants.some((variant) => variant.price > 0);
  const currentPrice = current.variants.some((variant) => variant.price > 0);
  if (nextPrice !== currentPrice) return nextPrice;
  if (next.variants.length !== current.variants.length) return next.variants.length > current.variants.length;
  if (next.slug.length !== current.slug.length) return next.slug.length < current.slug.length;
  return next.slug.localeCompare(current.slug) < 0;
}

function collapseSamePanel(products: Product[]) {
  const byName = new Map<string, Product>();
  for (const product of products) {
    const key = normalizeProductName(product.name);
    const current = byName.get(key);
    if (!current || preferPanel(product, current)) byName.set(key, product);
  }
  return [...byName.values()];
}

function comparePanels(a: Product, b: Product) {
  const family = familyRank(a) - familyRank(b);
  if (family) return family;
  const price = Number(b.variants.some((variant) => variant.price > 0)) - Number(a.variants.some((variant) => variant.price > 0));
  if (price) return price;
  const badge = Number(b.badge === "Bestseller") - Number(a.badge === "Bestseller");
  if (badge) return badge;
  if (familyRank(a) === 8) {
    const color = sheetColorRank(a) - sheetColorRank(b);
    if (color) return color;
  }
  const colors = colorCount(b) - colorCount(a);
  if (colors) return colors;
  const width = (a.workingWidthMm ?? 9999) - (b.workingWidthMm ?? 9999);
  if (width) return width;
  return a.name.localeCompare(b.name, "nl") || a.slug.localeCompare(b.slug);
}

export function pickBrandProfiles(products: Product[], brand?: { slug: string; name?: string }): BrandProfilePick {
  if (brand && isProfileBrandBlocked(brand.slug, brand.name ?? "")) return EMPTY_PICK;
  const scoped = brand ? products.filter((product) => product.brandSlug === brand.slug) : products;
  const eligible = collapseSamePanel(scoped.filter(isProfileCardProduct)).sort(comparePanels);
  if (!eligible.length) return EMPTY_PICK;
  const shown = eligible.slice(0, PROFILE_CARD_LIMIT);
  return {
    products: shown,
    total: eligible.length,
    hasMore: eligible.length > shown.length,
    sheets: eligible.every(isHplSheetCard),
  };
}
