import assert from "node:assert/strict";
import test from "node:test";

import { replacePublicProducts } from "../src/lib/db/store.ts";
import type { Sql } from "../src/lib/db/client.ts";
import type { Product } from "../src/lib/catalog/types.ts";

function product(slug: string): Product {
  return {
    slug,
    name: slug,
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "3 m",
    images: [],
    profileType: "sponning",
    sampleable: false,
    updatedAt: "2026-10-21T00:00:00.000Z",
  };
}

function queryText(strings: TemplateStringsArray, values: unknown[]) {
  const text = strings.join(" ").replace(/\s+/g, " ").trim();
  return values.length ? `${text} ${JSON.stringify(values)}` : text;
}

// Mirrors postgres.js sql.reserve(): tagged queries, json and unsafe, no begin().
function reservedConnection(log: string[], options?: { failInsert?: boolean }) {
  const run = (text: string) => {
    log.push(text);
    if (options?.failInsert && text.startsWith("insert")) throw new Error("insert mislukt");
    return Promise.resolve([]);
  };
  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    run(queryText(strings, values))) as unknown as Sql;
  sql.unsafe = ((query: string) => run(query)) as Sql["unsafe"];
  sql.json = ((value: unknown) => value) as Sql["json"];
  return sql;
}

test("replacePublicProducts commits on a reserved connection without begin", async () => {
  const log: string[] = [];
  const sql = reservedConnection(log);
  assert.equal("begin" in sql && typeof sql.begin === "function", false);

  await replacePublicProducts(sql, [product("keralit-sponning")]);

  assert.deepEqual(
    log.map((query) => query.split(" ")[0]),
    ["begin", "delete", "insert", "commit"],
  );
  assert.equal(log.some((query) => query.includes("keralit-sponning")), true);
});

test("replacePublicProducts rolls back a reserved connection when the insert fails", async () => {
  const log: string[] = [];
  const sql = reservedConnection(log, { failInsert: true });

  await assert.rejects(() => replacePublicProducts(sql, [product("kapot")]), /insert mislukt/);

  assert.deepEqual(
    log.map((query) => query.split(" ")[0]),
    ["begin", "delete", "insert", "rollback"],
  );
});

test("replacePublicProducts uses the pool begin when it exists", async () => {
  const log: string[] = [];
  const tx = reservedConnection(log);
  const pool = reservedConnection([]) as Sql;
  pool.begin = (async (run: (inner: Sql) => Promise<void>) => {
    log.push("pool.begin");
    await run(tx);
  }) as Sql["begin"];

  await replacePublicProducts(pool, [product("via-pool")]);

  assert.equal(log[0], "pool.begin");
  assert.equal(log.includes("begin"), false);
  assert.equal(log.includes("commit"), false);
  assert.equal(log.some((query) => query.startsWith("delete")), true);
  assert.equal(log.some((query) => query.includes("via-pool")), true);
});
