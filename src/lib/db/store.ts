import type { Sql } from "@/lib/db/client";
import { getSql } from "@/lib/db/client";
import type { Product } from "@/lib/catalog/types";
import { shopifyNumericId } from "@/lib/shopify/ids";
import type { ShopifyCollectionNode } from "@/lib/shopify/catalog";
import type { ShopifyProduct } from "@/lib/shopify/types";

export type CatalogCounts = {
  shopifyProducts: number;
  publicProducts: number;
  lastFullSync: string | null;
};

function missingTable(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "42P01");
}

export async function catalogCounts(): Promise<CatalogCounts | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const [raw] = await sql<{ n: number }[]>`select count(*)::int as n from shopify_product`;
    const [pub] = await sql<{ n: number }[]>`select count(*)::int as n from catalog_product`;
    const [state] = await sql<{ value: string }[]>`select value from catalog_state where key = 'last_full_sync'`;
    return {
      shopifyProducts: Number(raw?.n ?? 0),
      publicProducts: Number(pub?.n ?? 0),
      lastFullSync: state?.value ?? null,
    };
  } catch (error) {
    if (missingTable(error)) return { shopifyProducts: 0, publicProducts: 0, lastFullSync: null };
    throw error;
  }
}

export async function readStoredProducts(): Promise<Product[] | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql<{ payload: Product }[]>`select payload from catalog_product`;
    return rows.map((row) => row.payload);
  } catch (error) {
    if (missingTable(error)) return null;
    throw error;
  }
}

export async function readRawProducts(sql: Sql = mustSql()) {
  const rows = await sql<{ payload: ShopifyProduct }[]>`select payload from shopify_product`;
  return rows.map((row) => row.payload);
}

export async function readCollectionHandles(sql: Sql = mustSql()) {
  const rows = await sql<{ handle: string }[]>`select handle from shopify_collection`;
  return rows.map((row) => row.handle);
}

export async function upsertRawProducts(sql: Sql, products: ShopifyProduct[]) {
  for (const product of products) {
    const id = shopifyNumericId(product.id);
    if (!id || !product.handle) continue;
    await sql`delete from shopify_product where handle = ${product.handle} and id <> ${id}`;
    await sql`
      insert into shopify_product (id, handle, updated_at, payload, metafields)
      values (
        ${id},
        ${product.handle},
        ${product.updatedAt ?? null},
        ${sql.json(toJson(product))},
        ${sql.json(toJson([]))}
      )
      on conflict (id) do update set
        handle = excluded.handle,
        updated_at = excluded.updated_at,
        payload = excluded.payload,
        metafields = excluded.metafields,
        fetched_at = now()
    `;
  }
}

export async function deleteRawProductsExcept(sql: Sql, ids: string[]) {
  if (!ids.length) {
    await sql`delete from shopify_product`;
    return;
  }
  await sql`delete from shopify_product where not (id = any(${sql.array(ids)}))`;
}

export async function deleteRawProduct(sql: Sql, id: string, handle?: string) {
  if (handle) {
    await sql`delete from shopify_product where id = ${id} or handle = ${handle}`;
    return;
  }
  await sql`delete from shopify_product where id = ${id}`;
}

export async function findRawHandle(sql: Sql, id: string) {
  const [row] = await sql<{ handle: string }[]>`select handle from shopify_product where id = ${id} limit 1`;
  return row?.handle ?? null;
}

export async function upsertCollections(sql: Sql, collections: ShopifyCollectionNode[]) {
  for (const collection of collections) {
    const id = shopifyNumericId(collection.id) || collection.handle;
    await sql`delete from shopify_collection where handle = ${collection.handle} and id <> ${id}`;
    await sql`
      insert into shopify_collection (id, handle, title, description)
      values (${id}, ${collection.handle}, ${collection.title}, ${collection.description})
      on conflict (id) do update set
        handle = excluded.handle,
        title = excluded.title,
        description = excluded.description,
        fetched_at = now()
    `;
  }
}

export async function deleteCollectionsExcept(sql: Sql, ids: string[]) {
  if (!ids.length) {
    await sql`delete from shopify_collection`;
    return;
  }
  await sql`delete from shopify_collection where not (id = any(${sql.array(ids)}))`;
}

export async function deleteCollection(sql: Sql, id: string, handle?: string) {
  if (handle) {
    await sql`delete from shopify_collection where id = ${id} or handle = ${handle}`;
    return;
  }
  await sql`delete from shopify_collection where id = ${id}`;
}

export async function replacePublicProducts(sql: Sql, products: Product[]) {
  await withTransaction(sql, async (tx) => {
    await tx`delete from catalog_product`;
    for (const product of products) {
      await tx`
        insert into catalog_product (slug, category, brand_slug, updated_at, payload)
        values (
          ${product.slug},
          ${product.category},
          ${product.brandSlug},
          ${product.updatedAt ?? null},
          ${tx.json(toJson(product))}
        )
      `;
    }
  });
}

// sql.reserve() is one connection and has no begin(). A manual transaction
// stays on that connection, which also holds the advisory lock.
async function withTransaction(sql: Sql, run: (tx: Sql) => Promise<void>) {
  if (typeof sql.begin === "function") {
    await sql.begin(run);
    return;
  }
  await sql.unsafe("begin");
  try {
    await run(sql);
    await sql.unsafe("commit");
  } catch (error) {
    await sql.unsafe("rollback").catch(() => undefined);
    throw error;
  }
}

export async function markFullSync(sql: Sql, at = new Date().toISOString()) {
  await sql`
    insert into catalog_state (key, value, updated_at)
    values ('last_full_sync', ${at}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

function mustSql() {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL ontbreekt");
  return sql;
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Parameters<Sql["json"]>[0];
}
