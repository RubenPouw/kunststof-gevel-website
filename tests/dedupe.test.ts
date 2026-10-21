import assert from "node:assert/strict";
import test from "node:test";

import { dedupeProducts, findListedProduct } from "../src/lib/catalog/dedupe.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";

function variant(sku: string, price: number, shopifyVariantId: string): ProductVariant {
  return {
    sku,
    ean: "",
    colorName: "Antraciet",
    hex: "#3d3d3d",
    length: "6000 mm",
    price,
    inStock: price > 0,
    colorFamily: "donker",
    sampleId: sku,
    shopifyVariantId,
  };
}

function product(slug: string, price: number, shopifyVariantId: string): Product {
  return {
    slug,
    name: "Keralit rabat 167",
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: "Rabatdeel",
    specs: [],
    relatedSlugs: [],
    variants: [variant(`SKU-${slug}`, price, shopifyVariantId)],
    price,
    inStock: price > 0,
    meta: "",
    palette: [],
    colors: [],
    length: "6000 mm",
    images: [],
    profileType: "rabat",
    sampleable: true,
  };
}

test("a drafted -1 copy leaves the clean product on its own variant", () => {
  const clean = product("keralit-rabat-167", 0, "gid://shopify/ProductVariant/clean");
  const duplicate = product("keralit-rabat-167-1", 89.5, "gid://shopify/ProductVariant/drafted");

  const both = dedupeProducts([clean, duplicate]);
  assert.equal(both.length, 1);
  assert.equal(both[0]?.slug, "keralit-rabat-167");
  assert.deepEqual(both[0]?.aliasSlugs, ["keralit-rabat-167-1"]);
  assert.equal(both[0]?.variants[0]?.shopifyVariantId, "gid://shopify/ProductVariant/drafted");

  const survivor = dedupeProducts([clean]);
  assert.equal(survivor.length, 1);
  assert.equal(survivor[0]?.slug, "keralit-rabat-167");
  assert.deepEqual(survivor[0]?.aliasSlugs, []);
  assert.equal(survivor[0]?.variants[0]?.shopifyVariantId, "gid://shopify/ProductVariant/clean");
  assert.equal(survivor[0]?.price, 0);

  assert.equal(findListedProduct(survivor, "keralit-rabat-167")?.slug, "keralit-rabat-167");
  assert.equal(findListedProduct(survivor, "keralit-rabat-167-1")?.slug, "keralit-rabat-167");
  assert.equal(
    findListedProduct(survivor, "keralit-rabat-167-1")?.variants[0]?.shopifyVariantId,
    "gid://shopify/ProductVariant/clean",
  );
});

test("a priced clean copy stays purchasable after the duplicate disappears", () => {
  const clean = product("keralit-rabat-167", 120, "gid://shopify/ProductVariant/clean");
  const listed = dedupeProducts([clean]);
  const found = findListedProduct(listed, "keralit-rabat-167-1");
  assert.equal(found?.slug, "keralit-rabat-167");
  assert.equal(found?.variants[0]?.shopifyVariantId, "gid://shopify/ProductVariant/clean");
  assert.equal(found?.price, 120);
});
