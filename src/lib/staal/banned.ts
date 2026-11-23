/** These names never appear as a sample or as a filter on the staalaanvraag. */
const BANNED_SAMPLE = /duafort|profex|canexel|linerio|wonderboard/i;

export function isBannedSampleText(value: string) {
  return BANNED_SAMPLE.test(value);
}

export function isBannedSampleProduct(product: {
  slug?: string;
  name?: string;
  brand?: string;
  brandSlug?: string;
  vendor?: string;
}) {
  return isBannedSampleText(
    [product.slug, product.name, product.brand, product.brandSlug, product.vendor].filter(Boolean).join(" "),
  );
}
