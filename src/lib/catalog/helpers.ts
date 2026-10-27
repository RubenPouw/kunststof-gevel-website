import { colourCodeIn, colourSearchTokens, labelColour, supplierColourName } from "./colours";
import type { ListingPresentation, ListingSort, ListingView } from "./listing";
import { slugKey } from "./derive";
import type {
  Brand,
  ColorFamily,
  ListingFilters,
  Product,
  ProductGroup,
  ProductVariant,
  ProfileType,
} from "./types";
import { colorFamilies, productGroups, profileTypes } from "./types";

export type ListingFilterPatch = {
  brandSlug?: string | "";
  brandSlugs?: string[] | null;
  inStockOnly?: boolean;
  profileType?: ProfileType | "" | null;
  profileTypes?: ProfileType[] | null;
  productGroup?: ProductGroup | null;
  productGroups?: ProductGroup[] | null;
  colorFamily?: ColorFamily | "";
  workingWidthMm?: number;
  colorSlug?: string | "";
  colorSlugs?: string[] | null;
  ral?: string | "";
};

function splitCsv(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function assignList<T extends string>(list: T[]) {
  if (list.length > 1) return { one: undefined, many: list };
  if (list.length === 1) return { one: list[0], many: undefined };
  return { one: undefined, many: undefined };
}

function pickList<T extends string>(
  patch: object,
  listKey: string,
  oneKey: string,
  currentList: T[] | undefined,
  currentOne: T | undefined,
): T[] {
  if (listKey in patch) {
    const value = (patch as Record<string, T[] | null | undefined>)[listKey];
    if (!value) return [];
    return value.filter(Boolean);
  }
  if (oneKey in patch) {
    const value = (patch as Record<string, T | "" | null | undefined>)[oneKey];
    if (!value) return [];
    return [value];
  }
  if (currentList?.length) return currentList;
  return currentOne ? [currentOne] : [];
}

export function selectedBrands(filters: ListingFilters) {
  return filters.brandSlugs?.length ? filters.brandSlugs : filters.brandSlug ? [filters.brandSlug] : [];
}

export function selectedGroups(filters: ListingFilters) {
  return filters.productGroups?.length ? filters.productGroups : filters.productGroup ? [filters.productGroup] : [];
}

export function selectedProfileTypes(filters: ListingFilters) {
  return filters.profileTypes?.length ? filters.profileTypes : filters.profileType ? [filters.profileType] : [];
}

export function selectedColorSlugs(filters: ListingFilters) {
  return filters.colorSlugs?.length ? filters.colorSlugs : filters.colorSlug ? [filters.colorSlug] : [];
}

export function toggleValue<T extends string>(current: readonly T[], value: T): T[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function mergeListingFilters(current: ListingFilters, patch: ListingFilterPatch): ListingFilters {
  const brands = assignList(pickList<string>(patch, "brandSlugs", "brandSlug", current.brandSlugs, current.brandSlug));
  const groups = assignList(
    pickList<ProductGroup>(patch, "productGroups", "productGroup", current.productGroups, current.productGroup),
  );
  const types = assignList(
    pickList<ProfileType>(patch, "profileTypes", "profileType", current.profileTypes, current.profileType),
  );
  const colors = assignList(pickList<string>(patch, "colorSlugs", "colorSlug", current.colorSlugs, current.colorSlug));
  return {
    brandSlug: brands.one,
    brandSlugs: brands.many,
    inStockOnly: "inStockOnly" in patch ? patch.inStockOnly || undefined : current.inStockOnly,
    profileType: types.one,
    profileTypes: types.many,
    productGroup: groups.one,
    productGroups: groups.many,
    colorFamily: "colorFamily" in patch ? patch.colorFamily || undefined : current.colorFamily,
    workingWidthMm: "workingWidthMm" in patch ? patch.workingWidthMm : current.workingWidthMm,
    colorSlug: colors.one,
    colorSlugs: colors.many,
    ral: "ral" in patch ? patch.ral || undefined : current.ral,
  };
}

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

/** A Kleurnaam slug matches the full label, the supplier name, or the code. */
export function colourMatchesSlug(colorName: string, slug: string) {
  const label = labelColour(colorName);
  if (slugKey(label) === slug) return true;
  const code = colourCodeIn(label);
  if (!code) return false;
  if (slugKey(code) === slug) return true;
  const name = supplierColourName(code);
  return Boolean(name && slugKey(name) === slug);
}

export function applyListingFilters(list: Product[], filters: ListingFilters) {
  const brands = selectedBrands(filters);
  const groups = selectedGroups(filters);
  const types = selectedProfileTypes(filters);
  const colorSlugs = selectedColorSlugs(filters);
  return list.filter((product) => {
    if (brands.length && !brands.includes(product.brandSlug)) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    if (types.length && !types.includes(product.profileType)) return false;
    if (groups.length && (!product.productGroup || !groups.includes(product.productGroup))) return false;
    if (filters.workingWidthMm && product.workingWidthMm !== filters.workingWidthMm) return false;
    if (filters.colorFamily && !product.colors.some((color) => color.family === filters.colorFamily)) {
      return false;
    }
    if (
      colorSlugs.length &&
      !product.colors.some((color) => colorSlugs.some((slug) => colourMatchesSlug(color.name, slug)))
    ) {
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
  const brandParts = splitCsv(firstParam(searchParams.merk));
  const voorraad = firstParam(searchParams.voorraad);
  const typeParts = splitCsv(firstParam(searchParams.type)).filter((item): item is ProfileType =>
    profileTypes.includes(item as ProfileType),
  );
  const groupParts = splitCsv(firstParam(searchParams.groep)).filter((item): item is ProductGroup =>
    productGroups.includes(item as ProductGroup),
  );
  const kleurRaw = firstParam(searchParams.kleur);
  const breedteRaw = firstParam(searchParams.breedte);
  const colorParts = splitCsv(firstParam(searchParams.kleurnaam));
  const ralRaw = firstParam(searchParams.ral);
  const brands = assignList(brandParts);
  const types = assignList(typeParts);
  const groups = assignList(groupParts);
  const colors = assignList(colorParts);
  const colorFamily = colorFamilies.find((item) => item === kleurRaw);
  const workingWidthMm = breedteRaw && /^\d+$/.test(breedteRaw) ? Number(breedteRaw) : undefined;
  const ral = ralRaw && /^\d{4}$/.test(ralRaw) ? ralRaw : undefined;

  return {
    brandSlug: brands.one,
    brandSlugs: brands.many,
    inStockOnly: voorraad === "1",
    profileType: types.one,
    profileTypes: types.many,
    productGroup: groups.one,
    productGroups: groups.many,
    colorFamily,
    workingWidthMm,
    colorSlug: colors.one,
    colorSlugs: colors.many,
    ral,
  };
}

export function hasActiveFilters(filters: ListingFilters) {
  return Boolean(
    selectedBrands(filters).length ||
      filters.inStockOnly ||
      selectedProfileTypes(filters).length ||
      selectedGroups(filters).length ||
      filters.colorFamily ||
      filters.workingWidthMm ||
      selectedColorSlugs(filters).length ||
      filters.ral,
  );
}

function writeList(params: URLSearchParams, key: string, values: string[]) {
  if (values.length) params.set(key, values.join(","));
}

export function listingHref(
  basePath: string,
  current: ListingFilters,
  patch: ListingFilterPatch,
  presentation?: ListingPresentation,
) {
  const [path, existing] = basePath.split("?");
  const params = new URLSearchParams(existing);
  const next = mergeListingFilters(current, patch);
  ["merk", "voorraad", "type", "groep", "kleur", "breedte", "kleurnaam", "ral", "weergave", "sorteer", "pagina"].forEach(
    (key) => params.delete(key),
  );
  writeList(params, "merk", selectedBrands(next));
  if (next.inStockOnly) params.set("voorraad", "1");
  writeList(params, "type", selectedProfileTypes(next));
  writeList(params, "groep", selectedGroups(next));
  if (next.colorFamily) params.set("kleur", next.colorFamily);
  if (next.workingWidthMm) params.set("breedte", String(next.workingWidthMm));
  writeList(params, "kleurnaam", selectedColorSlugs(next));
  if (next.ral) params.set("ral", next.ral);
  if (presentation?.view === "raster") params.set("weergave", "raster");
  if (presentation?.sort && presentation.sort !== "relevantie") params.set("sorteer", presentation.sort);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function listingFacets(list: Product[]) {
  const types = new Map<ProfileType, number>();
  const groups = new Map<ProductGroup, number>();
  const families = new Map<ColorFamily, { count: number; hex: string }>();
  const widths = new Map<number, number>();
  const sheetColors = new Map<string, { name: string; count: number; hex: string; family: ColorFamily }>();
  const rals = new Map<string, number>();

  for (const product of list) {
    types.set(product.profileType, (types.get(product.profileType) ?? 0) + 1);
    if (product.productGroup) groups.set(product.productGroup, (groups.get(product.productGroup) ?? 0) + 1);
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
        family: current?.family ?? color.family,
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
    groups: productGroups
      .map((slug) => ({ slug, count: groups.get(slug) ?? 0 }))
      .filter((item) => item.count > 0),
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
      .sort(
        (a, b) =>
          colorFamilies.indexOf(a.family) - colorFamilies.indexOf(b.family) || a.name.localeCompare(b.name, "nl"),
      ),
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
      ...product.variants.flatMap((variant) => [variant.sku, variant.ean, ...colourSearchTokens(variant.colorName)]),
    ]
      .join(" ")
      .toLowerCase();
    if (haystack.includes(q)) return true;
    const needle = q.replace(/[^a-z0-9]/g, "");
    if (needle.length < 4) return false;
    return product.variants.some((variant) => {
      const sku = variant.sku.toLowerCase().replace(/[^a-z0-9]/g, "");
      const ean = variant.ean.toLowerCase().replace(/[^a-z0-9]/g, "");
      return sku.includes(needle) || ean.includes(needle);
    });
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
