import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { prepareListing, toListingCard } from "../src/lib/catalog/listing.ts";
import { decodeListingState, listingRewriteTarget } from "../src/lib/catalog/paths.ts";
import { parseListingSearchParams } from "../src/lib/catalog/helpers.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { shopifyNumericId } from "../src/lib/shopify/ids.ts";
import { verifyShopifyWebhookHmac } from "../src/lib/shopify/webhook.ts";

function variant(color: string, length: string, index: number): ProductVariant {
  return {
    sku: `${color}-${length}-${index}`,
    ean: "",
    colorName: color,
    hex: "#111111",
    length,
    price: 12,
    inStock: true,
    colorFamily: "donker",
    sampleId: `${color}-${length}`,
  };
}

function product(index: number): Product {
  const colors = ["Antraciet", "Wit", "Groen"];
  const lengths = ["3 m", "4 m", "5 m", "6 m"];
  return {
    slug: `product-${index}`,
    name: `Product ${index}`,
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: "Deze lange beschrijving hoort niet in de kaart.",
    specs: [{ label: "Materiaal", value: "kunststof" }],
    relatedSlugs: ["ander-product"],
    variants: colors.flatMap((color, colorIndex) =>
      lengths.map((length, lengthIndex) => variant(color, length, colorIndex * 10 + lengthIndex)),
    ),
    price: 12,
    inStock: true,
    meta: "meta",
    palette: [],
    colors: colors.map((name) => ({
      name,
      hex: "#111111",
      family: "donker" as const,
      sampleId: name,
    })),
    length: "3 m",
    images: [{ url: "https://cdn.shopify.com/voorbeeld.jpg", alt: "Product" }],
    profileType: index % 2 === 0 ? "sponning" : "rabat",
    sampleable: true,
  };
}

test("listing card keeps one swatch per colour and drops the description", () => {
  const card = toListingCard(product(1));
  assert.equal(card.swatches.length, 3);
  assert.equal(JSON.stringify(card).includes("beschrijving"), false);
  assert.equal(JSON.stringify(card).includes("kunststof"), false);
  assert.equal(card.swatches[0]?.length, "3 m");
});

test("prepareListing returns ten cards per page from the full list", () => {
  const all = Array.from({ length: 25 }, (_, index) => product(index));
  const page = prepareListing(all, {}, 2);
  assert.equal(page.cards.length, 10);
  assert.equal(page.total, 25);
  assert.equal(page.cards[0]?.slug, "product-10");
  assert.equal(page.pages, 3);
  assert.ok(page.facets.profileTypes.length >= 1);
});

test("pagina and filters rewrite to a cacheable path and back", () => {
  const search = new URLSearchParams("type=sponning&pagina=2");
  const path = listingRewriteTarget("/gevelbekleding", search);
  assert.equal(path, "/weergave/categorie/gevelbekleding/p/2/type/sponning");
  assert.equal(listingRewriteTarget("/gevelbekleding", new URLSearchParams("pagina=1")), null);
  assert.equal(listingRewriteTarget("/merken/keralit", new URLSearchParams()), null);

  const decoded = decodeListingState("categorie", "gevelbekleding", ["p", "2", "type", "sponning"]);
  assert.ok(decoded);
  const filters = parseListingSearchParams(Object.fromEntries(decoded.search.entries()));
  assert.equal(filters.profileType, "sponning");
  assert.equal(decoded.pagina, 2);
});

test("webhook hmac accepts the raw body and rejects a tampered one", () => {
  const body = '{"id":1}';
  const secret = "test-secret";
  const header = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  assert.equal(verifyShopifyWebhookHmac(body, header, secret), true);
  assert.equal(verifyShopifyWebhookHmac(`${body} `, header, secret), false);
  assert.equal(verifyShopifyWebhookHmac(body, header, ""), false);
});

test("shopify ids keep the trailing number", () => {
  assert.equal(shopifyNumericId("gid://shopify/Product/1091"), "1091");
  assert.equal(shopifyNumericId(1091), "1091");
});
