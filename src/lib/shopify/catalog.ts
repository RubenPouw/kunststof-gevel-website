import { cache } from "react";

import categoriesJson from "@/data/catalog/categories.json";

import type { Brand, Category, Product } from "@/lib/catalog/types";

import { storefrontFetch } from "./client";
import {
  brandsFromProducts,
  CATEGORY_COLLECTION_HANDLES,
  mapShopifyProduct,
} from "./map";
import {
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_PAGE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import type { ShopifyCollection, ShopifyPageInfo, ShopifyProduct } from "./types";

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

type CollectionByHandleData = {
  collection: (Omit<ShopifyCollection, "products"> & {
    products: { pageInfo: ShopifyPageInfo; nodes: ShopifyProduct[] };
  }) | null;
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

async function paginateCollection(handle: string) {
  const nodes: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let collection: { handle: string; title: string; description: string } | null = null;

  while (hasNextPage) {
    const data: CollectionByHandleData = await storefrontFetch<CollectionByHandleData>(
      COLLECTION_BY_HANDLE_QUERY,
      {
        handle,
        cursor,
      },
    );
    if (!data.collection) return null;
    collection = {
      handle: data.collection.handle,
      title: data.collection.title,
      description: data.collection.description,
    };
    nodes.push(...data.collection.products.nodes);
    hasNextPage = data.collection.products.pageInfo.hasNextPage;
    cursor = data.collection.products.pageInfo.endCursor;
  }

  return collection ? { ...collection, products: nodes } : null;
}

export type ShopifyCatalog = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  collectionHandles: string[];
};

export const loadShopifyCatalog = cache(async (): Promise<ShopifyCatalog> => {
  const [rawProducts, collections] = await Promise.all([
    paginateProducts(PRODUCTS_PAGE_QUERY),
    storefrontFetch<CollectionsData>(COLLECTIONS_QUERY).catch(() => ({
      collections: { nodes: [] },
    })),
  ]);

  const collectionHandles = collections.collections.nodes.map((collection) => collection.handle);
  const handlesByProduct = new Map<string, string[]>();

  const knownHandles = [
    ...new Set([
      ...collectionHandles,
      ...Object.values(CATEGORY_COLLECTION_HANDLES).flat(),
    ]),
  ];

  await Promise.all(
    knownHandles.map(async (handle) => {
      try {
        const collection = await paginateCollection(handle);
        if (!collection) return;
        for (const product of collection.products) {
          const current = handlesByProduct.get(product.handle) ?? [];
          current.push(collection.handle);
          handlesByProduct.set(product.handle, current);
        }
      } catch {
        // Collection not published to Storefront — fall back to productType / title.
      }
    }),
  );

  const products = rawProducts
    .map((product) => mapShopifyProduct(product, handlesByProduct.get(product.handle) ?? []))
    .filter((product): product is Product => Boolean(product));

  const relatedByCategory = new Map<string, string[]>();
  for (const product of products) {
    const list = relatedByCategory.get(product.category) ?? [];
    list.push(product.slug);
    relatedByCategory.set(product.category, list);
  }
  for (const product of products) {
    product.relatedSlugs = (relatedByCategory.get(product.category) ?? [])
      .filter((slug) => slug !== product.slug && products.find((item) => item.slug === slug)?.brandSlug === product.brandSlug)
      .slice(0, 4);
    if (product.relatedSlugs.length < 4) {
      const extra = (relatedByCategory.get(product.category) ?? [])
        .filter((slug) => slug !== product.slug && !product.relatedSlugs.includes(slug))
        .slice(0, 4 - product.relatedSlugs.length);
      product.relatedSlugs.push(...extra);
    }
  }

  return {
    products,
    brands: brandsFromProducts(products),
    categories: categoriesJson as Category[],
    collectionHandles,
  };
});

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

