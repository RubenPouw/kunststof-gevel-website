import { parseLengthMeters } from "@/lib/catalog/text-rules";
import type { Product, ProductVariant } from "@/lib/catalog/types";

/**
 * The four VinyPlus gevelpanelen, in display order.
 * Shopify handles first, then the static catalog handles of the same panel.
 */
export const VINYPLUS_PROFILE_SLUGS = [
  ["vinyplus-quattro-299mm", "vinyplus-quattro-299"],
  ["vinyplus-vario-299mm"],
  ["vinyplus-rondkantpaneel-150-mm", "vinyplus-rondkantpaneel-150"],
  ["vinyplus-rabatdeel-150-mm"],
] as const;

export const VINYPLUS_PROFILE_COPY = {
  title: "Kies je profiel",
  lead: "Quattro, Vario, Rondkant en Rabat. De prijs is de totaalprijs van de productlengte, incl. btw.",
  view: "Bekijk product",
  sample: "Vraag een staal aan",
  onRequest: "Prijs op aanvraag",
} as const;

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
  const meters = lengthMeters(length);
  if (!meters) return `Prijs is de hele productlengte, ${vat}. btw`;
  const cm = Math.round(meters * 100).toLocaleString("nl-NL");
  return `Per lengte van ${cm} cm, ${vat}. btw`;
}

export function widthLabel(product: Product): string | null {
  if (!product.workingWidthMm) return null;
  return `Werkende breedte ${product.workingWidthMm} mm`;
}

/**
 * Price of one full length, incl. btw, from the catalog.
 * The amount is the stored variant price of the longest length, never a per-metre rate
 * and never a fixed figure. A shorter length is ignored, even when it is cheaper.
 */
export function vinyplusLengthOffer(product: Product): { incl: number; length: string; variant: ProductVariant } | null {
  const priced = product.variants.filter((variant) => variant.price > 0);
  const withLength = priced.filter((variant) => lengthMeters(variant.length));
  const pool = withLength.length ? withLength : priced;
  if (!pool.length) return null;
  const longest = Math.max(...pool.map((variant) => lengthMeters(variant.length) ?? 0));
  const atLength = longest > 0 ? pool.filter((variant) => lengthMeters(variant.length) === longest) : pool;
  const variant = atLength.reduce((best, item) => (item.price < best.price ? item : best));
  return { incl: variant.price, length: variant.length, variant };
}

export function pickVinyplusProfiles(products: Product[]): Product[] {
  const bySlug = new Map<string, Product>();
  for (const product of products) {
    bySlug.set(product.slug, product);
    for (const alias of product.aliasSlugs ?? []) bySlug.set(alias, product);
  }
  const picked: Product[] = [];
  const seen = new Set<string>();
  for (const slugs of VINYPLUS_PROFILE_SLUGS) {
    const product = slugs.map((slug) => bySlug.get(slug)).find((item): item is Product => Boolean(item));
    if (!product || seen.has(product.slug)) continue;
    seen.add(product.slug);
    picked.push(product);
  }
  return picked;
}
