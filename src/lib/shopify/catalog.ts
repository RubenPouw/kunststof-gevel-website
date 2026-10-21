import categoriesJson from "@/data/catalog/categories.json";
import { dedupeProducts } from "@/lib/catalog/dedupe";

import type { Brand, Category, Product } from "@/lib/catalog/types";

import { storefrontFetch } from "./client";
import { brandsFromProducts, mapShopifyProduct } from "./map";
import {
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_PAGE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import type { ShopifyPageInfo, ShopifyProduct } from "./types";

type ProductsPageData = {
  products: {
    pageInfo: ShopifyPageInfo;
    nodes: ShopifyProduct[];
  };
};

type ProductByHandleData = {
  product: ShopifyProduct | null;
};

type CollectionsData = {
  collections: { nodes: { handle: string; title: string; description: string }[] };
};

type SearchData = {
  search: { nodes: Array<{ handle?: string } | null> };
};

async function paginateProducts(query: string, variables: Record<string, unknown> = {}) {
  const nodes: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: ProductsPageData = await storefrontFetch<ProductsPageData>(query, {
      ...variables,
      cursor,
    });
    nodes.push(...data.products.nodes);
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return nodes;
}

export type ShopifyCatalog = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  collectionHandles: string[];
};


const CATALOG_TTL_MS = 60 * 60 * 1000;

let memoryCache: { at: number; catalog: ShopifyCatalog } | null = null;
let memoryInflight: Promise<ShopifyCatalog> | null = null;

async function loadShopifyCatalogFresh(): Promise<ShopifyCatalog> {
  const [rawProducts, collections] = await Promise.all([
    paginateProducts(PRODUCTS_PAGE_QUERY),
    storefrontFetch<CollectionsData>(COLLECTIONS_QUERY).catch(() => ({
      collections: { nodes: [] },
    })),
  ]);

  const collectionHandles = collections.collections.nodes.map((collection) => collection.handle);
  const products = dedupeProducts(
    rawProducts
      .map((product) =>
        mapShopifyProduct(
          product,
          product.collections?.nodes.map((collection) => collection.handle) ?? [],
        ),
      )
      .filter((product): product is Product => Boolean(product)),
  );

  const byCategory = new Map<string, Product[]>();
  for (const product of products) {
    const list = byCategory.get(product.category) ?? [];
    list.push(product);
    byCategory.set(product.category, list);
  }
  for (const product of products) {
    const pool = byCategory.get(product.category) ?? [];
    const sameBrand = pool.filter((item) => item.slug !== product.slug && item.brandSlug === product.brandSlug);
    const rest = pool.filter((item) => item.slug !== product.slug && item.brandSlug !== product.brandSlug);
    product.relatedSlugs = [...sameBrand, ...rest].slice(0, 4).map((item) => item.slug);
  }

  return {
    products,
    brands: brandsFromProducts(products),
    categories: categoriesJson as Category[],
    collectionHandles,
  };
}

export function loadShopifyCatalog(): Promise<ShopifyCatalog> {
  if (memoryCache && Date.now() - memoryCache.at < CATALOG_TTL_MS) {
    return Promise.resolve(memoryCache.catalog);
  }
  if (!memoryInflight) {
    memoryInflight = loadShopifyCatalogFresh()
      .then((catalog) => {
        memoryCache = { at: Date.now(), catalog };
        return catalog;
      })
      .finally(() => {
        memoryInflight = null;
      });
  }
  return memoryInflight;
}

export async function fetchShopifyProductByHandle(handle: string) {
  const data = await storefrontFetch<ProductByHandleData>(PRODUCT_BY_HANDLE_QUERY, { handle });
  if (!data.product) return null;
  return mapShopifyProduct(data.product);
}

export async function fetchShopifySearchHandles(query: string) {
  const data = await storefrontFetch<SearchData>(SEARCH_PRODUCTS_QUERY, { query });
  return data.search.nodes
    .map((node) => node?.handle)
    .filter((handle): handle is string => Boolean(handle));
}

