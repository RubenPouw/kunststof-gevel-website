import { publicProductSlug } from "@/lib/catalog/dedupe";
import { categorySlugs } from "@/lib/catalog/types";
import type { Sql } from "@/lib/db/client";
import { getSql } from "@/lib/db/client";
import {
  deleteCollection,
  deleteCollectionsExcept,
  deleteRawProduct,
  deleteRawProductsExcept,
  findRawHandle,
  markFullSync,
  readCollectionHandles,
  readRawProducts,
  replacePublicProducts,
  upsertCollections,
  upsertRawProducts,
} from "@/lib/db/store";
import {
  assembleCatalog,
  fetchShopifyCollection,
  fetchShopifyProductNode,
  fetchShopifySnapshot,
} from "@/lib/shopify/catalog";
import { isShopifyConfigured } from "@/lib/shopify/config";
import { shopifyNumericId } from "@/lib/shopify/ids";

const LOCK = 814271;

export type CatalogTouch = {
  slugs: string[];
  categories: string[];
  brands: string[];
  all?: boolean;
  ignored?: boolean;
  inventory?: boolean;
};

async function withLock<T>(fn: (sql: Sql) => Promise<T>) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL ontbreekt");
  const reserved = await sql.reserve();
  try {
    await reserved`select pg_advisory_lock(${LOCK})`;
    return await fn(reserved);
  } finally {
    await reserved`select pg_advisory_unlock(${LOCK})`.catch(() => undefined);
    reserved.release();
  }
}

async function rebuild(sql: Sql) {
  const raw = await readRawProducts(sql);
  const handles = await readCollectionHandles(sql);
  const catalog = assembleCatalog(
    raw,
    handles.map((handle) => ({ handle })),
  );
  await replacePublicProducts(sql, catalog.products);
  return catalog;
}

export async function syncCatalogFromShopify(reason: string) {
  if (!isShopifyConfigured()) throw new Error("Shopify Storefront is niet geconfigureerd");
  return withLock(async (sql) => {
    const snapshot = await fetchShopifySnapshot(true);
    await upsertRawProducts(sql, snapshot.products);
    await deleteRawProductsExcept(
      sql,
      snapshot.products.map((product) => shopifyNumericId(product.id)).filter(Boolean),
    );
    await upsertCollections(sql, snapshot.collections);
    await deleteCollectionsExcept(
      sql,
      snapshot.collections.map((collection) => shopifyNumericId(collection.id) || collection.handle),
    );
    const catalog = await rebuild(sql);
    await markFullSync(sql);
    console.log(
      `[catalog] sync ${reason}: ${snapshot.products.length} shopify, ${catalog.products.length} publiek`,
    );
    return {
      shopifyProducts: snapshot.products.length,
      publicProducts: catalog.products.length,
      touch: { all: true, slugs: [], categories: [...categorySlugs], brands: [] } satisfies CatalogTouch,
    };
  });
}

export async function applyShopifyWebhook(
  topic: string,
  body: { id?: number | string; handle?: string; admin_graphql_api_id?: string },
): Promise<CatalogTouch> {
  if (topic === "inventory_levels/update") {
    return { all: false, slugs: [], categories: [], brands: [], inventory: true } satisfies CatalogTouch;
  }
  if (topic.startsWith("collections/")) return applyCollectionWebhook(topic, body);
  if (topic.startsWith("products/")) return applyProductWebhook(topic, body);
  return { all: false, slugs: [], categories: [], brands: [], ignored: true } satisfies CatalogTouch;
}

async function applyProductWebhook(
  topic: string,
  body: { id?: number | string; handle?: string; admin_graphql_api_id?: string },
) {
  const id = shopifyNumericId(body.admin_graphql_api_id || body.id);
  const handle = body.handle?.trim() ?? "";
  return withLock(async (sql) => {
    const knownHandle = handle || (id ? (await findRawHandle(sql, id)) ?? "" : "");
    const slugs = new Set<string>();
    if (knownHandle) slugs.add(publicProductSlug(knownHandle));
    if (handle) slugs.add(publicProductSlug(handle));
    const previous = knownHandle ? await brandOfSlug(sql, publicProductSlug(knownHandle)) : null;
    const removed = topic === "products/delete";
    const node = !removed && (handle || knownHandle) ? await fetchShopifyProductNode(handle || knownHandle) : null;
    if (removed || !node) {
      if (id || knownHandle || handle) await deleteRawProduct(sql, id, knownHandle || handle || undefined);
    } else {
      slugs.add(publicProductSlug(node.handle));
      await upsertRawProducts(sql, [node]);
    }
    const catalog = await rebuild(sql);
    const brands = new Set<string>();
    if (previous) brands.add(previous);
    for (const product of catalog.products) {
      if (slugs.has(product.slug)) brands.add(product.brandSlug);
    }
    return {
      slugs: [...slugs],
      categories: [...categorySlugs],
      brands: [...brands],
    } satisfies CatalogTouch;
  });
}

async function applyCollectionWebhook(
  topic: string,
  body: { id?: number | string; handle?: string; admin_graphql_api_id?: string },
) {
  const id = shopifyNumericId(body.admin_graphql_api_id || body.id);
  const handle = body.handle?.trim() ?? "";
  return withLock(async (sql) => {
    if (topic === "collections/delete" || !handle) {
      if (id || handle) await deleteCollection(sql, id, handle || undefined);
      await rebuild(sql);
      return { slugs: [], categories: [...categorySlugs], brands: [] } satisfies CatalogTouch;
    }
    const fetched = await fetchShopifyCollection(handle);
    if (!fetched) {
      await deleteCollection(sql, id, handle);
      await rebuild(sql);
      return { slugs: [], categories: [...categorySlugs], brands: [] } satisfies CatalogTouch;
    }
    await upsertCollections(sql, [fetched.collection]);
    await upsertRawProducts(sql, fetched.products);
    const catalog = await rebuild(sql);
    const slugs = fetched.products.map((product) => publicProductSlug(product.handle));
    const slugSet = new Set(slugs);
    const brands = catalog.products.filter((product) => slugSet.has(product.slug)).map((product) => product.brandSlug);
    return {
      slugs,
      categories: [...categorySlugs],
      brands: [...new Set(brands)],
    } satisfies CatalogTouch;
  });
}

async function brandOfSlug(sql: Sql, slug: string) {
  const [row] = await sql<{ brand_slug: string }[]>`
    select brand_slug from catalog_product where slug = ${slug} limit 1
  `;
  return row?.brand_slug ?? null;
}
