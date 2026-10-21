import duplicatePublicSlugs from "../../../data/seo/duplicate-public-slugs.json" with { type: "json" };
import {
  canonicalHandle,
  hasPurchasePrice,
  sanitizeDescription,
} from "@/lib/catalog/text-rules";
import type { Product, ProductImage } from "@/lib/catalog/types";

/** Shopify handle of the active `-1` copy → public slug of the empty handle, now draft. */
const duplicateHandleToClean = duplicatePublicSlugs as Record<string, string>;

/** Public product slug. Known `-1` copies are served on the clean handle. Other handles stay. */
export function publicProductSlug(handle: string) {
  return duplicateHandleToClean[handle] ?? handle;
}

function positivePrice(product: Product) {
  return Math.max(0, ...product.variants.map((variant) => variant.price), product.price);
}

function pricedVariantCount(product: Product) {
  return product.variants.filter((variant) => hasPurchasePrice(variant.price)).length;
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

function cleanedDescription(text: string, name: string) {
  const clean = sanitizeDescription(text, name);
  const fallback = sanitizeDescription("", name);
  if (!text.trim() || clean === fallback) return "";
  return clean;
}

function mergeGroup(group: Product[]): Product {
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
  const slug = publicProductSlug(donor.slug);
  const aliasSlugs = [
    ...new Set(group.flatMap((product) => [product.slug, ...(product.aliasSlugs ?? [])])),
  ].filter((item) => item !== slug);
  const priced = donor.variants.filter((variant) => hasPurchasePrice(variant.price));
  const variants = priced.length ? priced : donor.variants;
  const description =
    [donor, ...group]
      .map((product) => cleanedDescription(product.description, donor.name))
      .find(Boolean) || sanitizeDescription(donor.description, donor.name);

  return {
    ...donor,
    slug,
    aliasSlugs,
    images: uniqueImages([donor, ...group]),
    description: sanitizeDescription(description, donor.name),
    variants,
    price: variants.length ? Math.min(...variants.map((variant) => variant.price)) : donor.price,
    inStock: variants.some((variant) => variant.inStock),
  };
}

/**
 * Find a listed product by its public slug or by the active `-1` handle.
 * `/producten/{clean}-1` resolves to the same product as `/producten/{clean}`.
 */
export function findListedProduct<T extends { slug: string; aliasSlugs?: string[] }>(
  products: T[],
  slug: string,
) {
  const direct = products.find((product) => product.slug === slug || product.aliasSlugs?.includes(slug));
  if (direct) return direct;
  const clean = publicProductSlug(slug);
  if (clean !== slug) {
    return products.find((product) => product.slug === clean || product.aliasSlugs?.includes(clean));
  }
  return products.find((product) => product.aliasSlugs?.includes(slug) || publicProductSlug(product.slug) === slug);
}

/**
 * Collapse a drafted empty handle and its active `-1` copy into one product.
 * The public URL is the clean handle. Price, variants, SKU and description come from the `-1` copy.
 * A handle that merely ends in `-1` and is not one of those pairs is left alone.
 * Nothing is written back to Shopify.
 */
export function dedupeProducts(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = publicProductSlug(product.slug);
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
