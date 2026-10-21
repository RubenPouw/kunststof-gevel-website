import type { ProductImage, ProductVariant } from "@/lib/catalog/types";

type WithVariantImages = {
  images: ProductImage[];
  variants: ProductVariant[];
};

/** Supplier files are named `…_<sku>_SZ1.jpg`. Match that, never the variant index. */
function embeddedSku(url: string) {
  const file = url.split("?")[0]?.split("/").pop() ?? "";
  return file.match(/_(\d{5,})(?:_|\.|$)/)?.[1];
}

/**
 * Prefer the gallery file whose name contains this variant's SKU.
 * If Shopify attached another variant's file and no matching file exists, drop it.
 */
export function correctVariantImages<T extends WithVariantImages>(product: T): T {
  const pool: ProductImage[] = [];
  const seen = new Set<string>();
  function add(image: ProductImage | undefined) {
    if (!image?.url || seen.has(image.url)) return;
    seen.add(image.url);
    pool.push(image);
  }
  for (const image of product.images) add(image);
  for (const variant of product.variants) add(variant.image);

  const skus = new Set(product.variants.map((variant) => variant.sku).filter(Boolean));
  let changed = false;
  const variants = product.variants.map((variant) => {
    const matched = pool.find((image) => embeddedSku(image.url) === variant.sku);
    if (matched) {
      if (variant.image?.url === matched.url) return variant;
      changed = true;
      return { ...variant, image: matched };
    }
    const current = variant.image?.url ? embeddedSku(variant.image.url) : undefined;
    if (current && current !== variant.sku && skus.has(current)) {
      changed = true;
      return { ...variant, image: undefined };
    }
    return variant;
  });
  if (!changed) return product;
  return { ...product, variants };
}
