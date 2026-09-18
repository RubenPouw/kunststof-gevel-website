import type {
  Brand,
  ColorFamily,
  ListingFilters,
  Product,
  ProductVariant,
  ProfileType,
} from "./types";
import { colorFamilies, profileTypes } from "./types";

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

export function applyListingFilters(list: Product[], filters: ListingFilters) {
  return list.filter((product) => {
    if (filters.brandSlug && product.brandSlug !== filters.brandSlug) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    if (filters.profileType && product.profileType !== filters.profileType) return false;
    if (filters.workingWidthMm && product.workingWidthMm !== filters.workingWidthMm) return false;
    if (filters.colorFamily && !product.colors.some((color) => color.family === filters.colorFamily)) {
      return false;
    }
    return true;
  });
}

export function brandsInProducts(list: Product[], brands: Brand[]) {
  const slugs = [...new Set(list.map((product) => product.brandSlug))];
  return slugs
    .map((slug) => brands.find((brand) => brand.slug === slug))
    .filter((brand): brand is Brand => Boolean(brand));
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListingFilters {
  const brandSlug = firstParam(searchParams.merk);
  const voorraad = firstParam(searchParams.voorraad);
  const typeRaw = firstParam(searchParams.type);
  const kleurRaw = firstParam(searchParams.kleur);
  const breedteRaw = firstParam(searchParams.breedte);
  const profileType = profileTypes.find((item) => item === typeRaw);
  const colorFamily = colorFamilies.find((item) => item === kleurRaw);
  const workingWidthMm = breedteRaw && /^\d+$/.test(breedteRaw) ? Number(breedteRaw) : undefined;

  return {
    brandSlug: brandSlug || undefined,
    inStockOnly: voorraad === "1",
    profileType,
    colorFamily,
    workingWidthMm,
  };
}

export function listingHref(
  basePath: string,
  current: ListingFilters,
  patch: Partial<ListingFilters> & { brandSlug?: string | "" },
) {
  const next: ListingFilters = { ...current, ...patch };
  const params = new URLSearchParams();
  const brand = patch.brandSlug === "" ? undefined : next.brandSlug;
  if (brand) params.set("merk", brand);
  if (next.inStockOnly) params.set("voorraad", "1");
  if (next.profileType) params.set("type", next.profileType);
  if (next.colorFamily) params.set("kleur", next.colorFamily);
  if (next.workingWidthMm) params.set("breedte", String(next.workingWidthMm));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function listingFacets(list: Product[]) {
  const types = new Map<ProfileType, number>();
  const families = new Map<ColorFamily, { count: number; hex: string }>();
  const widths = new Map<number, number>();

  for (const product of list) {
    types.set(product.profileType, (types.get(product.profileType) ?? 0) + 1);
    if (product.workingWidthMm) {
      widths.set(product.workingWidthMm, (widths.get(product.workingWidthMm) ?? 0) + 1);
    }
    const seen = new Set<ColorFamily>();
    for (const color of product.colors) {
      if (seen.has(color.family)) continue;
      seen.add(color.family);
      const current = families.get(color.family);
      families.set(color.family, {
        count: (current?.count ?? 0) + 1,
        hex: current?.hex ?? color.hex,
      });
    }
  }

  return {
    profileTypes: [...types.entries()]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count),
    colorFamilies: [...families.entries()].map(([slug, value]) => ({
      slug,
      count: value.count,
      hex: value.hex,
    })),
    widths: [...widths.entries()]
      .map(([mm, count]) => ({ mm, count }))
      .sort((a, b) => a.mm - b.mm),
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
      product.profileType,
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
