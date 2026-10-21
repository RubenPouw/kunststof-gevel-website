import categoriesJson from "@/data/catalog/categories.json";
import { dedupeProducts } from "@/lib/catalog/dedupe";

import type { Brand, Category, Product } from "@/lib/catalog/types";

import { storefrontFetch } from "./client";
import { brandsFromProducts, mapShopifyProduct } from "./map";
import {
  COLLECTION_BY_HANDLE_QUERY,
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

export type ShopifyCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
};

type CollectionsData = {
  collections: {
    pageInfo: ShopifyPageInfo;
    nodes: ShopifyCollectionNode[];
  };
};

type CollectionByHandleData = {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: {
      pageInfo: ShopifyPageInfo;
      nodes: ShopifyProduct[];
    };
  } | null;
};

type SearchData = {
  search: { nodes: Array<{ handle?: string } | null> };
};

async function paginateProducts(query: string, fresh: boolean) {
  const nodes: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let pages = 0;

  while (hasNextPage && pages < 30) {
    const data: ProductsPageData = await storefrontFetch<ProductsPageData>(
      query,
      { cursor },
      undefined,
      fresh,
    );
    pages += 1;
    nodes.push(...data.products.nodes);
    const next = data.products.pageInfo.endCursor;
    hasNextPage = data.products.pageInfo.hasNextPage && Boolean(next) && next !== cursor;
    cursor = next;
    console.log(`[catalog] producten pagina ${pages}: ${nodes.length}`);
  }

  return nodes;
}

async function paginateCollections(fresh: boolean) {
  const nodes: ShopifyCollectionNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let pages = 0;

  while (hasNextPage && pages < 10) {
    const data: CollectionsData = await storefrontFetch<CollectionsData>(
      COLLECTIONS_QUERY,
      { cursor },
      undefined,
      fresh,
    );
    pages += 1;
    nodes.push(...data.collections.nodes);
    const next = data.collections.pageInfo.endCursor;
    hasNextPage = data.collections.pageInfo.hasNextPage && Boolean(next) && next !== cursor;
    cursor = next;
  }

  return nodes;
}

export async function fetchShopifySnapshot(fresh = false) {
  const [products, collections] = await Promise.all([
    paginateProducts(PRODUCTS_PAGE_QUERY, fresh),
    paginateCollections(fresh).catch((error) => {
      console.error("[catalog] collecties ophalen mislukt", error);
      return [] as ShopifyCollectionNode[];
    }),
  ]);
  return { products, collections };
}

export function assembleCatalog(
  rawProducts: ShopifyProduct[],
  collections: { handle: string }[],
): ShopifyCatalog {
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
    collectionHandles: collections.map((collection) => collection.handle),
  };
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
  const snapshot = await fetchShopifySnapshot(false);
  return assembleCatalog(snapshot.products, snapshot.collections);
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

export async function fetchShopifyProductNode(handle: string) {
  const data = await storefrontFetch<ProductByHandleData>(PRODUCT_BY_HANDLE_QUERY, { handle }, undefined, true);
  return data.product;
}

export async function fetchShopifyProductByHandle(handle: string) {
  const product = await fetchShopifyProductNode(handle);
  if (!product) return null;
  return mapShopifyProduct(
    product,
    product.collections?.nodes.map((collection) => collection.handle) ?? [],
  );
}

export async function fetchShopifyCollection(handle: string) {
  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let collection: ShopifyCollectionNode | null = null;

  let pages = 0;
  while (hasNextPage && pages < 30) {
    const data: CollectionByHandleData = await storefrontFetch<CollectionByHandleData>(
      COLLECTION_BY_HANDLE_QUERY,
      { handle, cursor },
      undefined,
      true,
    );
    pages += 1;
    if (!data.collection) return null;
    collection = {
      id: data.collection.id,
      handle: data.collection.handle,
      title: data.collection.title,
      description: data.collection.description,
    };
    products.push(...data.collection.products.nodes);
    const next = data.collection.products.pageInfo.endCursor;
    hasNextPage = data.collection.products.pageInfo.hasNextPage && Boolean(next) && next !== cursor;
    cursor = next;
  }

  if (!collection) return null;
  return { collection, products };
}

export async function fetchShopifySearchHandles(query: string) {
  const data = await storefrontFetch<SearchData>(SEARCH_PRODUCTS_QUERY, { query });
  return data.search.nodes
    .map((node) => node?.handle)
    .filter((handle): handle is string => Boolean(handle));
}

