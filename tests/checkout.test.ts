import assert from "node:assert/strict";
import test from "node:test";

import { createShopifyCheckout, isShopifyCheckoutUrl, toE164 } from "../src/lib/shopify/checkout.ts";

const customer = {
  name: "Test Klant",
  email: "test@example.com",
  phone: "030 227 1397",
  address: "Spinsterlaan 6A",
  postcode: "3454 WZ",
  city: "Utrecht",
};

test("toE164 normalises a Dutch local number", () => {
  assert.equal(toE164("030 227 1397"), "+31302271397");
  assert.equal(toE164("+31613639368"), "+31613639368");
});

test("isShopifyCheckoutUrl only accepts Shopify hosts", () => {
  assert.equal(isShopifyCheckoutUrl("https://shop.myshopify.com/cart/c/abc"), true);
  assert.equal(isShopifyCheckoutUrl("https://kunststof-gevel.nl/bedankt"), false);
  assert.equal(isShopifyCheckoutUrl("http://shop.myshopify.com/cart"), false);
});

test("checkout does not pretend success without Shopify", async () => {
  delete process.env.SHOPIFY_STORE_DOMAIN;
  delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const empty = await createShopifyCheckout({ lines: [], customer, montage: false });
  assert.equal(empty.ok, false);
  if (empty.ok) return;
  assert.match(empty.error, /winkelwagen is leeg/);

  const kozijn = await createShopifyCheckout({
    lines: [{ productSlug: "x", variantSku: "y", quantity: 1, kind: "kozijn" }],
    customer,
    montage: false,
  });
  assert.equal(kozijn.ok, false);
  if (kozijn.ok) return;
  assert.match(kozijn.error, /offerte/);

  const unpaid = await createShopifyCheckout({
    lines: [{ productSlug: "keralit", variantSku: "nee", quantity: 1, kind: "product" }],
    customer,
    montage: false,
  });
  assert.equal(unpaid.ok, false);
  if (unpaid.ok) return;
  assert.match(unpaid.error, /niets besteld/);
  assert.match(unpaid.error, /030 227 1397/);
});
