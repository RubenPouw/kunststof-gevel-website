import {
  applyListingFilters,
  getDefaultVariant,
  listingFacets,
  listingHref,
  productHasPrice,
} from "@/lib/catalog/helpers";
import type { ListingFilters, Product, ProductImage } from "@/lib/catalog/types";

export const PAGE_SIZE = 10;

export type ListingFacets = ReturnType<typeof listingFacets>;

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
  hasPrice: boolean;
  swatches: ListingSwatch[];
  activeIndex: number;
};

export function toListingCard(product: Product): ListingCardModel {
  const fallback = product.variants.length ? getDefaultVariant(product) : undefined;
  const colors = product.colors.slice(0, 8);
  const swatches: ListingSwatch[] = colors.map((color) => {
    const variant =
      product.variants.find((item) => item.colorName === color.name && item.length === fallback?.length) ??
      product.variants.find((item) => item.colorName === color.name) ??
      fallback;
    return {
      name: color.name,
      hex: variant?.hex || color.hex,
      ral: variant?.ral ?? color.ral,
      sampleId: variant?.sampleId || color.sampleId,
      sku: variant?.sku ?? product.slug,
      price: variant?.price ?? 0,
      inStock: variant?.inStock ?? product.inStock,
      stockText: variant?.stockText ?? product.stockText,
      length: variant?.length ?? product.length,
      image: variant?.image ?? product.images[0],
    };
  });
  if (!swatches.length && fallback) {
    swatches.push({
      name: fallback.colorName,
      hex: fallback.hex,
      ral: fallback.ral,
      sampleId: fallback.sampleId,
      sku: fallback.sku,
      price: fallback.price,
      inStock: fallback.inStock,
      stockText: fallback.stockText,
      length: fallback.length,
      image: fallback.image ?? product.images[0],
    });
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
    hasPrice: productHasPrice(product),
    swatches,
    activeIndex,
  };
}

export function prepareListing(all: Product[], filters: ListingFilters, page: number, pageSize = PAGE_SIZE) {
  const filtered = applyListingFilters(all, filters);
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

export function listingPageHref(basePath: string, filters: ListingFilters, pagina: number) {
  const href = listingHref(basePath, filters, {});
  if (pagina <= 1) return href;
  const [path, query] = href.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("pagina", String(pagina));
  const next = params.toString();
  return next ? `${path}?${next}` : path;
}

export function catalogusQuery(basePath: string, filters: ListingFilters, pagina: number) {
  const href = listingPageHref(basePath, filters, pagina);
  const params = new URLSearchParams(href.split("?")[1] ?? "");
  params.set("basis", basePath);
  if (!params.has("pagina")) params.set("pagina", String(Math.max(1, pagina)));
  return `/api/catalogus?${params.toString()}`;
}
