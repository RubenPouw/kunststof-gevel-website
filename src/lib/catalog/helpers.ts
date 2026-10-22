import type { ListingPresentation, ListingSort, ListingView } from "./listing";
import { slugKey } from "./derive";
import type {
  Brand,
  ColorFamily,
  ListingFilters,
  Product,
  ProductVariant,
  ProfileType,
} from "./types";
import { colorFamilies, profileTypes } from "./types";

const LISTING_SORTS = new Set<ListingSort>(["relevantie", "naam", "prijs-op", "prijs-af"]);

export function parseListingPresentation(
  search: URLSearchParams | Record<string, string | string[] | undefined>,
): ListingPresentation {
  const read = (key: string) => {
    if (search instanceof URLSearchParams) return search.get(key) ?? undefined;
    const value = search[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const view: ListingView = read("weergave") === "raster" ? "raster" : "lijst";
  const sortRaw = read("sorteer");
  const sort: ListingSort = sortRaw && LISTING_SORTS.has(sortRaw as ListingSort) ? (sortRaw as ListingSort) : "relevantie";
  return { view, sort };
}

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
  return (
    product.variants.find((variant) => variant.popular && variant.price > 0) ??
    product.variants.find((variant) => variant.price > 0) ??
    product.variants[0]
  );
}

export function productHasPrice(product: Product) {
  return product.variants.some((variant) => variant.price > 0) && product.price > 0;
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
    if (filters.colorSlug && !product.colors.some((color) => slugKey(color.name) === filters.colorSlug)) {
      return false;
    }
    if (filters.ral && !product.colors.some((color) => color.ral?.replace(/\D/g, "") === filters.ral)) {
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
  const colorSlug = firstParam(searchParams.kleurnaam);
  const ralRaw = firstParam(searchParams.ral);
  const profileType = profileTypes.find((item) => item === typeRaw);
  const colorFamily = colorFamilies.find((item) => item === kleurRaw);
  const workingWidthMm = breedteRaw && /^\d+$/.test(breedteRaw) ? Number(breedteRaw) : undefined;
  const ral = ralRaw && /^\d{4}$/.test(ralRaw) ? ralRaw : undefined;

  return {
    brandSlug: brandSlug || undefined,
    inStockOnly: voorraad === "1",
    profileType,
    colorFamily,
    workingWidthMm,
    colorSlug: colorSlug || undefined,
    ral,
  };
}

export function hasActiveFilters(filters: ListingFilters) {
  return Boolean(
    filters.brandSlug ||
      filters.inStockOnly ||
      filters.profileType ||
      filters.colorFamily ||
      filters.workingWidthMm ||
      filters.colorSlug ||
      filters.ral,
  );
}

export function listingHref(
  basePath: string,
  current: ListingFilters,
  patch: Partial<ListingFilters> & { brandSlug?: string | "" },
  presentation?: ListingPresentation,
) {
  const [path, existing] = basePath.split("?");
  const params = new URLSearchParams(existing);
  const next: ListingFilters = { ...current, ...patch };
  const brand = patch.brandSlug === "" ? undefined : next.brandSlug;
  ["merk", "voorraad", "type", "kleur", "breedte", "kleurnaam", "ral", "weergave", "sorteer", "pagina"].forEach((key) =>
    params.delete(key),
  );
  if (brand) params.set("merk", brand);
  if (next.inStockOnly) params.set("voorraad", "1");
  if (next.profileType) params.set("type", next.profileType);
  if (next.colorFamily) params.set("kleur", next.colorFamily);
  if (next.workingWidthMm) params.set("breedte", String(next.workingWidthMm));
  if (next.colorSlug) params.set("kleurnaam", next.colorSlug);
  if (next.ral) params.set("ral", next.ral);
  if (presentation?.view === "raster") params.set("weergave", "raster");
  if (presentation?.sort && presentation.sort !== "relevantie") params.set("sorteer", presentation.sort);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function listingFacets(list: Product[]) {
  const types = new Map<ProfileType, number>();
  const families = new Map<ColorFamily, { count: number; hex: string }>();
  const widths = new Map<number, number>();
  const sheetColors = new Map<string, { name: string; count: number; hex: string }>();
  const rals = new Map<string, number>();

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
    for (const color of product.colors) {
      const key = slugKey(color.name);
      const current = sheetColors.get(key);
      sheetColors.set(key, {
        name: current?.name ?? color.name,
        count: (current?.count ?? 0) + 1,
        hex: current?.hex ?? color.hex,
      });
      if (product.saleUnit === "sheet" || product.category === "hpl-platen") {
        const ral = color.ral?.replace(/\D/g, "");
        if (ral && /^\d{4}$/.test(ral)) rals.set(ral, (rals.get(ral) ?? 0) + 1);
      }
    }
  }

  return {
    profileTypes: [...types.entries()]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count),
    colorFamilies: [...families.entries()]
      .map(([slug, value]) => ({
        slug,
        count: value.count,
        hex: value.hex,
      }))
      .sort((a, b) => colorFamilies.indexOf(a.slug) - colorFamilies.indexOf(b.slug)),
    widths: [...widths.entries()]
      .map(([mm, count]) => ({ mm, count }))
      .sort((a, b) => a.mm - b.mm),
    sheetColors: [...sheetColors.entries()]
      .map(([slug, value]) => ({ slug, ...value }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "nl")),
    rals: [...rals.entries()]
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => a.code.localeCompare(b.code, "nl", { numeric: true })),
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

export function profileRole(product: Product): "noodzakelijk" | "aanbevolen" | null {
  const name = product.name.toLowerCase();
  const accessory =
    product.category === "montage" ||
    product.profileType === "profiel" ||
    /profiel|schroef|eindkap|hoekstuk|verbind/.test(name);
  if (!accessory) return null;
  if (/schroef|startprofiel|ventilatie|\bclip\b/.test(name)) return "noodzakelijk";
  return "aanbevolen";
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
