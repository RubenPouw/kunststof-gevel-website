import assert from "node:assert/strict";
import test from "node:test";

import duplicatePublicSlugs from "../data/seo/duplicate-public-slugs.json" with { type: "json" };
import { dedupeProducts, findListedProduct, publicProductSlug } from "../src/lib/catalog/dedupe.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { productJsonLd } from "../src/lib/seo/schema.ts";

const pairs = duplicatePublicSlugs as Record<string, string>;

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

function product(
  slug: string,
  price: number,
  shopifyVariantId: string,
  extra: Partial<Product> = {},
): Product {
  return {
    slug,
    name: extra.name ?? "Keralit rabat 167",
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: extra.description ?? "Rabatdeel",
    specs: [],
    relatedSlugs: [],
    variants: extra.variants ?? [variant(extra.meta ?? `SKU-${slug}`, price, shopifyVariantId)],
    price,
    inStock: price > 0,
    meta: "",
    palette: [],
    colors: [],
    length: "6000 mm",
    images: [],
    profileType: "rabat",
    sampleable: true,
    ...extra,
    slug,
  };
}

test("every active -1 handle is published on the clean slug", () => {
  assert.equal(Object.keys(pairs).length, 301);
  for (const [duplicate, clean] of Object.entries(pairs)) {
    assert.equal(publicProductSlug(duplicate), clean);
    assert.equal(publicProductSlug(clean), clean);
    assert.equal(duplicate, `${clean}-1`);
  }
  assert.equal(publicProductSlug("h-verbindingprofiel-4mm-1"), "h-verbindingprofiel-4mm-1");
});

test("a lone -1 copy is served on the clean url with its own product data", () => {
  const duplicate = "eurotexx-potdeksel-180-mm-structuur-1";
  const clean = pairs[duplicate];
  assert.equal(clean, "eurotexx-potdeksel-180-mm-structuur");
  const listed = dedupeProducts([
    product(duplicate, 89.5, "gid://shopify/ProductVariant/live", {
      name: "Eurotexx potdeksel 180 mm",
      description: "Echte omschrijving van het actieve artikel, met SKU.",
      variants: [variant("ET-180-ANTR", 89.5, "gid://shopify/ProductVariant/live")],
    }),
  ]);
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.slug, clean);
  assert.deepEqual(listed[0]?.aliasSlugs, [duplicate]);
  assert.equal(listed[0]?.name, "Eurotexx potdeksel 180 mm");
  assert.equal(listed[0]?.description, "Echte omschrijving van het actieve artikel, met SKU");
  assert.equal(listed[0]?.variants[0]?.sku, "ET-180-ANTR");
  assert.equal(listed[0]?.variants[0]?.shopifyVariantId, "gid://shopify/ProductVariant/live");
  assert.equal(listed[0]?.price, 89.5);

  assert.equal(findListedProduct(listed, clean)?.slug, clean);
  assert.equal(findListedProduct(listed, duplicate)?.slug, clean);

  const schema = productJsonLd(listed[0]!, "Gevelbekleding");
  assert.equal(schema.url, "https://www.kunststof-gevel.nl/producten/eurotexx-potdeksel-180-mm-structuur");
  assert.equal(schema.sku, "ET-180-ANTR");
});

test("the empty clean copy does not replace the active -1 product", () => {
  const clean = product("eurotexx-potdeksel-180-mm-structuur", 0, "gid://shopify/ProductVariant/empty", {
    name: "Leeg artikel",
    description: "",
    variants: [variant("", 0, "gid://shopify/ProductVariant/empty")],
  });
  const live = product("eurotexx-potdeksel-180-mm-structuur-1", 89.5, "gid://shopify/ProductVariant/live", {
    name: "Eurotexx potdeksel 180 mm",
    description: "Werkende breedte 180 mm, met het echte artikelnummer.",
    variants: [variant("ET-180-ANTR", 89.5, "gid://shopify/ProductVariant/live")],
  });
  const listed = dedupeProducts([clean, live]);
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.slug, "eurotexx-potdeksel-180-mm-structuur");
  assert.deepEqual(listed[0]?.aliasSlugs, ["eurotexx-potdeksel-180-mm-structuur-1"]);
  assert.equal(listed[0]?.name, "Eurotexx potdeksel 180 mm");
  assert.equal(listed[0]?.description, "Werkende breedte 180 mm, met het echte artikelnummer");
  assert.equal(listed[0]?.variants[0]?.sku, "ET-180-ANTR");
  assert.equal(listed[0]?.variants[0]?.shopifyVariantId, "gid://shopify/ProductVariant/live");
  assert.equal(listed[0]?.price, 89.5);
});

test("a real handle that ends in -1 is not rewritten", () => {
  const listed = dedupeProducts([
    product("h-verbindingprofiel-4mm-1", 12, "gid://shopify/ProductVariant/real"),
  ]);
  assert.equal(listed[0]?.slug, "h-verbindingprofiel-4mm-1");
  assert.deepEqual(listed[0]?.aliasSlugs, []);
});
