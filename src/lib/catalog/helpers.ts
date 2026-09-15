import type { Brand, Product, ProductVariant } from "./types";

export function getVariant(product: Product, sku: string) {
  return product.variants.find((variant) => variant.sku === sku);
}

export function getVariantBySku(products: Product[], sku: string) {
  for (const product of products) {
    const variant = getVariant(product, sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants.find((variant) => variant.popular) ?? product.variants[0];
}

export function applyListingFilters(
  list: Product[],
  filters: { brandSlug?: string; inStockOnly?: boolean },
) {
  return list.filter((product) => {
    if (filters.brandSlug && product.brandSlug !== filters.brandSlug) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    return true;
  });
}

export function brandsInProducts(list: Product[], brands: Brand[]) {
  const slugs = [...new Set(list.map((product) => product.brandSlug))];
  return slugs
    .map((slug) => brands.find((brand) => brand.slug === slug))
    .filter((brand): brand is Brand => Boolean(brand));
}

export function parseListingSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const merkRaw = searchParams.merk;
  const voorraadRaw = searchParams.voorraad;
  const brandSlug = Array.isArray(merkRaw) ? merkRaw[0] : merkRaw;
  const voorraad = Array.isArray(voorraadRaw) ? voorraadRaw[0] : voorraadRaw;
  return {
    brandSlug: brandSlug || undefined,
    inStockOnly: voorraad === "1",
  };
}

export function filterProductsByQuery(products: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.brand,
      product.vendor,
      product.meta,
      product.category,
      product.productType ?? "",
      product.slug,
      ...product.variants.flatMap((variant) => [variant.sku, variant.ean, variant.colorName]),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function relatedProductsOf(product: Product, products: Product[]) {
  const bySlug = new Map(products.map((item) => [item.slug, item]));
  const fromField = product.relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Product => Boolean(item));
  if (fromField.length) return fromField;

  return products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        (item.brandSlug === product.brandSlug || item.category === product.category),
    )
    .slice(0, 4);
}
