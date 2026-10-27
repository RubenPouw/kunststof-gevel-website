import {
  applyListingFilters,
  getDefaultVariant,
  listingFacets,
  listingHref,
  productHasPrice,
} from "@/lib/catalog/helpers";
import type { ListingFilters, Product, ProductGroup, ProductImage } from "@/lib/catalog/types";

export const PAGE_SIZE = 10;
export const CATEGORY_PAGE_SIZE = 16;

export type ListingSort = "relevantie" | "naam" | "prijs-op" | "prijs-af";
export type ListingView = "lijst" | "raster";

export type ListingPresentation = {
  view: ListingView;
  sort: ListingSort;
};

export const DEFAULT_PRESENTATION: ListingPresentation = { view: "lijst", sort: "relevantie" };

export type ListingFacets = ReturnType<typeof listingFacets>;

export type ListingLengthOption = {
  length: string;
  sku: string;
  price: number;
  inStock: boolean;
  stockText?: string;
  image?: ProductImage;
  shopifyVariantId?: string;
};

export type ListingSwatch = {
  name: string;
  hex: string;
  ral?: string;
  sampleId: string;
  sku: string;
  price: number;
  inStock: boolean;
  stockText?: string;
  length: string;
  image?: ProductImage;
  shopifyVariantId?: string;
  lengths: ListingLengthOption[];
};

/** Fields the listing card actually paints. One swatch per colour, not every length. */
export type ListingCardModel = {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  saleUnit?: "sheet";
  workingWidthMm?: number;
  sampleable: boolean;
  category: Product["category"];
  hasPrice: boolean;
  swatches: ListingSwatch[];
  activeIndex: number;
};

function lengthOptions(product: Product, colorName: string): ListingLengthOption[] {
  const seen = new Set<string>();
  const options: ListingLengthOption[] = [];
  for (const variant of product.variants) {
    if (variant.colorName !== colorName || seen.has(variant.length)) continue;
    seen.add(variant.length);
    options.push({
      length: variant.length,
      sku: variant.sku,
      price: variant.price,
      inStock: variant.inStock,
      stockText: variant.stockText,
      image: variant.image ?? product.images[0],
      shopifyVariantId: variant.shopifyVariantId,
    });
  }
  return options;
}

function swatchFrom(product: Product, name: string, hex: string, ral: string | undefined, sampleId: string, preferredLength?: string): ListingSwatch {
  let lengths = lengthOptions(product, name);
  if (!lengths.length) {
    const fallback = product.variants.length ? getDefaultVariant(product) : undefined;
    if (fallback) {
      lengths = [
        {
          length: fallback.length,
          sku: fallback.sku,
          price: fallback.price,
          inStock: fallback.inStock,
          stockText: fallback.stockText,
          image: fallback.image ?? product.images[0],
          shopifyVariantId: fallback.shopifyVariantId,
        },
      ];
    }
  }
  const picked = lengths.find((item) => item.length === preferredLength) ?? lengths[0];
  return {
    name,
    hex: picked ? product.variants.find((item) => item.sku === picked.sku)?.hex || hex : hex,
    ral,
    sampleId,
    sku: picked?.sku ?? product.slug,
    price: picked?.price ?? 0,
    inStock: picked?.inStock ?? product.inStock,
    stockText: picked?.stockText ?? product.stockText,
    length: picked?.length ?? product.length,
    image: picked?.image ?? product.images[0],
    shopifyVariantId: picked?.shopifyVariantId,
    lengths,
  };
}

const GROUP_RANK: Record<ProductGroup, number> = {
  gevelpaneel: 0,
  afwerkprofiel: 1,
  toebehoren: 2,
};

export function sortProducts(list: Product[], sort: ListingSort) {
  if (sort === "relevantie") {
    return [...list].sort(
      (a, b) => (a.productGroup ? GROUP_RANK[a.productGroup] : 3) - (b.productGroup ? GROUP_RANK[b.productGroup] : 3),
    );
  }
  if (sort === "naam") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "nl") || a.slug.localeCompare(b.slug, "nl"));
  }
  if (sort === "prijs-op" || sort === "prijs-af") {
    return [...list].sort((a, b) => {
      const aMissing = a.price <= 0;
      const bMissing = b.price <= 0;
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      const diff = sort === "prijs-op" ? a.price - b.price : b.price - a.price;
      return diff || a.name.localeCompare(b.name, "nl");
    });
  }
  return list;
}

export function toListingCard(product: Product): ListingCardModel {
  const fallback = product.variants.length ? getDefaultVariant(product) : undefined;
  const colors = product.colors;
  const swatches: ListingSwatch[] = colors.map((color) =>
    swatchFrom(product, color.name, color.hex, color.ral, color.sampleId, fallback?.length),
  );
  if (!swatches.length && fallback) {
    swatches.push(swatchFrom(product, fallback.colorName, fallback.hex, fallback.ral, fallback.sampleId, fallback.length));
  }
  const activeIndex = Math.max(
    0,
    swatches.findIndex((swatch) => swatch.name === fallback?.colorName),
  );
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    brandSlug: product.brandSlug,
    saleUnit: product.saleUnit,
    workingWidthMm: product.workingWidthMm,
    sampleable: product.sampleable,
    category: product.category,
    hasPrice: productHasPrice(product),
    swatches,
    activeIndex,
  };
}

export function prepareListing(
  all: Product[],
  filters: ListingFilters,
  page: number,
  pageSize = PAGE_SIZE,
  sort: ListingSort = "relevantie",
) {
  const filtered = sortProducts(applyListingFilters(all, filters), sort);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page || 1), pages);
  const start = (safePage - 1) * pageSize;
  return {
    cards: filtered.slice(start, start + pageSize).map(toListingCard),
    total: filtered.length,
    totalUnfiltered: all.length,
    facets: listingFacets(all),
    page: safePage,
    pages,
    pageSize,
    filters,
  };
}

export function listingPageHref(
  basePath: string,
  filters: ListingFilters,
  pagina: number,
  presentation: ListingPresentation = DEFAULT_PRESENTATION,
) {
  const href = listingHref(basePath, filters, {}, presentation);
  if (pagina <= 1) return href;
  const [path, query] = href.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("pagina", String(pagina));
  const next = params.toString();
  return next ? `${path}?${next}` : path;
}

export function catalogusQuery(
  basePath: string,
  filters: ListingFilters,
  pagina: number,
  presentation: ListingPresentation = DEFAULT_PRESENTATION,
) {
  const href = listingPageHref(basePath, filters, pagina, presentation);
  const params = new URLSearchParams(href.split("?")[1] ?? "");
  params.set("basis", basePath.split("?")[0] || basePath);
  if (!params.has("pagina")) params.set("pagina", String(Math.max(1, pagina)));
  return `/api/catalogus?${params.toString()}`;
}
