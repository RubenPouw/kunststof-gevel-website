import {
  canonicalHandle,
  hasPurchasePrice,
  normalizeProductName,
  sanitizeDescription,
} from "@/lib/catalog/text-rules";
import type { Product, ProductImage } from "@/lib/catalog/types";

function positivePrice(product: Product) {
  return Math.max(0, ...product.variants.map((variant) => variant.price), product.price);
}

function pricedVariantCount(product: Product) {
  return product.variants.filter((variant) => hasPurchasePrice(variant.price)).length;
}

function descriptionScore(text: string, name: string) {
  const clean = sanitizeDescription(text, name);
  const token = normalizeProductName(name).split(" ").slice(0, 3).join(" ");
  let score = Math.min(clean.length, 800);
  if (token && normalizeProductName(clean).includes(token)) score += 400;
  if (/aj fust/i.test(text)) score -= 200;
  return score;
}

function uniqueImages(products: Product[]): ProductImage[] {
  const images: ProductImage[] = [];
  const seen = new Set<string>();
  for (const product of products) {
    for (const image of product.images) {
      if (!image.url || seen.has(image.url)) continue;
      seen.add(image.url);
      images.push(image);
    }
  }
  return images;
}

function mergeGroup(group: Product[]): Product {
  if (group.length === 1) {
    const only = group[0];
    return {
      ...only,
      description: sanitizeDescription(only.description, only.name),
      aliasSlugs: only.aliasSlugs ?? [],
    };
  }

  const ranked = [...group].sort((a, b) => {
    const price = positivePrice(b) - positivePrice(a);
    if (price) return price;
    const variants = pricedVariantCount(b) - pricedVariantCount(a);
    if (variants) return variants;
    const images = b.images.length - a.images.length;
    if (images) return images;
    return a.slug.length - b.slug.length;
  });

  const donor = ranked[0];
  const clean = group.find((product) => canonicalHandle(product.slug) === product.slug);
  const slug = clean?.slug ?? donor.slug;
  const aliasSlugs = [...new Set(group.map((product) => product.slug).filter((item) => item !== slug))];
  const priced = donor.variants.filter((variant) => hasPurchasePrice(variant.price));
  const variants = priced.length ? priced : donor.variants;
  const description = [...group].sort(
    (a, b) => descriptionScore(b.description, donor.name) - descriptionScore(a.description, donor.name),
  )[0].description;

  return {
    ...donor,
    slug,
    aliasSlugs,
    images: uniqueImages([donor, ...group]),
    description: sanitizeDescription(description, donor.name),
    variants,
    price: Math.min(...variants.map((variant) => variant.price)),
    inStock: variants.some((variant) => variant.inStock),
  };
}

/**
 * Find a listed product by its public slug or by a duplicate handle (`slug-1`).
 * A request for the duplicate still resolves after that copy leaves the Storefront.
 */
export function findListedProduct<T extends { slug: string; aliasSlugs?: string[] }>(
  products: T[],
  slug: string,
) {
  const direct = products.find((product) => product.slug === slug || product.aliasSlugs?.includes(slug));
  if (direct) return direct;
  const base = slug.replace(/-1$/, "");
  if (base !== slug) {
    return products.find((product) => product.slug === base || product.aliasSlugs?.includes(base));
  }
  return products.find((product) => product.slug === `${base}-1` || product.aliasSlugs?.includes(slug));
}

/**
 * Collapse Shopify duplicates (same title, often `slug` and `slug-1`).
 * The public URL keeps the clean handle. While both copies are in the Storefront, prices and variant ids come from the copy that has a price.
 * When the `-1` copy is drafted and disappears, the remaining product is listed with its own variant id.
 * Nothing is written back to Shopify.
 */
export function dedupeProducts(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = normalizeProductName(product.name) || canonicalHandle(product.slug);
    const list = groups.get(key) ?? [];
    list.push(product);
    groups.set(key, list);
  }
  return [...groups.values()].map(mergeGroup);
}

export function duplicateHandleReport(handles: string[]) {
  const byBase = new Map<string, string[]>();
  for (const handle of handles) {
    const base = canonicalHandle(handle);
    const list = byBase.get(base) ?? [];
    list.push(handle);
    byBase.set(base, list);
  }
  return [...byBase.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([base, list]) => ({ base, handles: [...list].sort() }))
    .sort((a, b) => a.base.localeCompare(b.base));
}
