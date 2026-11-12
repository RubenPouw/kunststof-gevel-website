/**
 * Linerio is drafted in Shopify. Wonderboard and hygienische wandbekleding
 * stay active for hygienischewandbekleding.nl. Profex and Duafort are no longer
 * sold here. None of them belong on kunststof-gevel.nl. Shopify itself is unchanged.
 */

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const HIDDEN_NAME = /linerio|wonderboard|profex|duafort|canexel/i;
const HIDDEN_TYPE = "hygienische wandbekleding";

export function isHiddenOnKunststofGevel(product: {
  handle?: string;
  slug?: string;
  title?: string;
  name?: string;
  vendor?: string;
  brand?: string;
  brandSlug?: string;
  productType?: string;
}): boolean {
  const blob = [product.handle, product.slug, product.title, product.name, product.vendor, product.brand, product.brandSlug]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");
  if (HIDDEN_NAME.test(blob)) return true;
  return fold(product.productType ?? "") === HIDDEN_TYPE;
}
