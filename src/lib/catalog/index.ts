import { cache } from "react";

import { findListedProduct } from "@/lib/catalog/dedupe";
import { databaseUrl } from "@/lib/db/client";
import { readStoredProducts } from "@/lib/db/store";
import { isShopifyConfigured } from "@/lib/shopify/config";
import { fetchShopifySearchHandles, loadShopifyCatalog } from "@/lib/shopify/catalog";
import { brandsFromProducts } from "@/lib/shopify/map";

import {
  applyListingFilters,
  brandsInProducts as brandsInProductList,
  filterProductsByQuery,
  getDefaultVariant,
  getVariant,
  getVariantBySku,
  hasActiveFilters,
  listingFacets,
  listingHref,
  parseListingSearchParams,
  relatedProductsOf,
} from "./helpers";
import {
  featuredProductSlugs,
  getStaticBrand,
  getStaticCategory,
  shopifyCsv,
  shopifyCsvRows,
  staticBrands,
  staticCategories,
  staticProducts,
} from "./static";
import type { Brand, Category, CategorySlug, Product, ProductImage } from "./types";

export type {
  Brand,
  Category,
  CategorySlug,
  ColorFamily,
  ListingFilters,
  Product,
  ProductBadge,
  ProductColor,
  ProductImage,
  ProductVariant,
  ProfileType,
  SampleColor,
  Spec,
} from "./types";
export {
  categorySlugs,
  colorFamilies,
  colorFamilyLabels,
  profileTypeLabels,
  profileTypes,
} from "./types";
export {
  applyListingFilters,
  getDefaultVariant,
  getVariant,
  getVariantBySku,
  hasActiveFilters,
  listingFacets,
  listingHref,
  parseListingSearchParams,
};
export { featuredProductSlugs, shopifyCsv, shopifyCsvRows };
export { listSampleColors, neededPanels, uniqueLengths, findVariant } from "./derive";

export type CatalogData = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  source: "postgres" | "shopify" | "static";
};

const CATALOG_MEMORY_MS = 30_000;
let catalogMemory: { at: number; data: CatalogData } | null = null;

export function clearCatalogCache() {
  catalogMemory = null;
}

function staticCatalog(): CatalogData {
  return {
    products: staticProducts,
    brands: staticBrands,
    categories: staticCategories,
    source: "static",
  };
}

async function loadCatalog(): Promise<CatalogData> {
  if (databaseUrl()) {
    try {
      const products = await readStoredProducts();
      if (products && products.length) {
        const brands = brandsFromProducts(products);
        return {
          products,
          brands: brands.length ? brands : staticBrands,
          categories: staticCategories,
          source: "postgres",
        };
      }
    } catch (error) {
      console.error("[catalog] Postgres niet bereikbaar, val terug op Shopify", error);
    }
  }

  if (!isShopifyConfigured()) return staticCatalog();

  try {
    const shopify = await loadShopifyCatalog();
    if (!shopify.products.length) {
      console.warn("[catalog] Shopify gaf geen producten; val terug op statische catalogus.");
      return staticCatalog();
    }
    return {
      products: shopify.products,
      brands: shopify.brands.length ? shopify.brands : staticBrands,
      categories: shopify.categories,
      source: "shopify",
    };
  } catch (error) {
    console.error("[catalog] Shopify Storefront mislukt, statische fallback", error);
    return staticCatalog();
  }
}

export const getCatalog = cache(async (): Promise<CatalogData> => {
  if (catalogMemory && Date.now() - catalogMemory.at < CATALOG_MEMORY_MS) return catalogMemory.data;
  const data = await loadCatalog();
  catalogMemory = { at: Date.now(), data };
  return data;
});

export async function listProducts() {
  return (await getCatalog()).products;
}

export async function listBrands() {
  return (await getCatalog()).brands;
}

export async function listCategories() {
  return (await getCatalog()).categories;
}

export async function getProduct(slug: string) {
  return findListedProduct(await listProducts(), slug);
}

export async function getCategory(slug: string) {
  return getStaticCategory(slug) ?? (await listCategories()).find((category) => category.slug === slug);
}

export async function getBrand(slug: string) {
  return (await listBrands()).find((brand) => brand.slug === slug) ?? getStaticBrand(slug);
}

export async function getProductsByCategory(category: CategorySlug) {
  return (await listProducts()).filter((product) => product.category === category);
}

export async function getProductsByBrand(brandSlug: string) {
  return (await listProducts()).filter((product) => product.brandSlug === brandSlug);
}

export async function getRelatedProducts(product: Product) {
  return relatedProductsOf(product, await listProducts());
}

export async function searchProducts(query: string) {
  const products = await listProducts();
  const local = filterProductsByQuery(products, query);
  if (!query.trim() || !isShopifyConfigured()) return local;

  try {
    const handles = await fetchShopifySearchHandles(query);
    if (!handles.length) return local;
    const byHandle = new Map<string, Product>();
    for (const product of products) {
      byHandle.set(product.slug, product);
      for (const alias of product.aliasSlugs ?? []) byHandle.set(alias, product);
    }
    const fromSearch = handles
      .map((handle) => byHandle.get(handle))
      .filter((product): product is Product => Boolean(product));
    const extra = local.filter((product) => !fromSearch.some((item) => item.slug === product.slug));
    return [...fromSearch, ...extra];
  } catch {
    return local;
  }
}

export async function brandsInProducts(list: Product[]) {
  return brandsInProductList(list, await listBrands());
}

export async function getFeaturedProducts() {
  const products = await listProducts();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const featured = featuredProductSlugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is Product => Boolean(product));
  if (featured.length) return featured;

  const gevel = products.filter((product) => product.category === "gevelbekleding");
  return withPhotosFirst(gevel.length ? gevel : products).slice(0, 4);
}

function withPhotosFirst(products: Product[]) {
  return [...products].sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0));
}

/** First product photo per category, for category tiles. */
export async function getCategoryImages() {
  const images: Partial<Record<CategorySlug, ProductImage>> = {};
  for (const product of await listProducts()) {
    if (!images[product.category] && product.images[0]) {
      images[product.category] = product.images[0];
    }
  }
  return images;
}

export const brands = staticBrands;
export const categories = staticCategories;
export const products = staticProducts;
