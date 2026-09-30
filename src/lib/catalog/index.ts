import { cache } from "react";

import { isShopifyConfigured } from "@/lib/shopify/config";
import { fetchShopifySearchHandles, loadShopifyCatalog } from "@/lib/shopify/catalog";

import {
  applyListingFilters,
  brandsInProducts as brandsInProductList,
  filterProductsByQuery,
  getDefaultVariant,
  getVariant,
  getVariantBySku,
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
  source: "shopify" | "static";
};

function staticCatalog(): CatalogData {
  return {
    products: staticProducts,
    brands: staticBrands,
    categories: staticCategories,
    source: "static",
  };
}

export const getCatalog = cache(async (): Promise<CatalogData> => {
  if (!isShopifyConfigured()) {
    return staticCatalog();
  }

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
  const products = await listProducts();
  const direct = products.find((product) => product.slug === slug);
  if (direct) return direct;
  const base = slug.replace(/-(\d+)$/, "");
  if (base !== slug) {
    return products.find((product) => product.slug === base);
  }
  return products.find((product) => product.slug.startsWith(`${slug}-`));
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
    const byHandle = new Map(products.map((product) => [product.slug, product]));
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
