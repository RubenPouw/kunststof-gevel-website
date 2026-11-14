import assert from "node:assert/strict";
import test from "node:test";

import { kozijnCartLine, kozijnConfigQuery } from "../src/lib/kozijnen/cart-line.ts";
import {
  buildMixedDraftOrder,
  clampKozijnQty,
  createMixedDraftOrder,
  priceKozijnOrder,
  type PricedKozijn,
} from "../src/lib/kozijnen/checkout.ts";
import { getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig } from "../src/lib/kozijnen/model.ts";
import { priceLayoutConfig } from "../src/lib/kozijnen/quote-price.ts";
import { createShopifyCheckout } from "../src/lib/shopify/checkout.ts";

const flags = {
  KOZIJNEN_PRIJZEN_ACTIEF: "true",
  KOZIJNEN_CHECKOUT_ACTIEF: "true",
};

const customer = {
  name: "Test Klant",
  email: "test@example.com",
  phone: "030 227 1397",
  address: "Spinsterlaan 6A",
  postcode: "3454 WZ",
  city: "Utrecht",
};

const secret = /EKO|eko4u|marginPercent|inkoop|1,70|69[,.]08|21[,.]95/;

function layoutQuery() {
  const layout = getLayoutBySlug("draaikiepraam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  return { layout, config, query: kozijnConfigQuery(config) };
}

function address() {
  return {
    first_name: "Test",
    last_name: "Klant",
    address1: "Spinsterlaan 6A",
    city: "Utrecht",
    zip: "3454 WZ",
    country: "Netherlands",
  };
}

test("server price ignores a client amount and matches the price engine", () => {
  const { layout, config, query } = layoutQuery();
  const priced = priceKozijnOrder(layout.slug, `${query}&prijs=1`, flags);
  const engine = priceLayoutConfig(layout, config, true);
  assert.ok(priced);
  assert.equal(engine.pricesActive, true);
  if (!priced || !engine.pricesActive) return;
  assert.equal(priced.unitExcl, engine.totalExcl);
  assert.equal(priced.unitIncl, engine.totalIncl);
  assert.notEqual(priced.unitExcl, 1);
  assert.match(priced.title, /Draaikiepraam/);
  assert.equal(priced.properties.some((item) => item.name === "Levertijd" && item.value === "4 weken"), true);
  assert.equal(secret.test(JSON.stringify(priced.properties)), false);
  assert.equal(secret.test(priced.summary), false);

  const display = kozijnCartLine(config, 1);
  assert.equal(display.price, 1);
  assert.equal(display.kozijnQuery, query);
  assert.notEqual(display.price, priced.unitExcl);
  const otherStep = kozijnCartLine({ ...config, step: "overzicht" }, priced.unitExcl);
  assert.equal(otherStep.variantSku, display.variantSku);
});

test("a kozijn without an online price cannot be sold", () => {
  const { layout, query } = layoutQuery();
  assert.equal(priceKozijnOrder(layout.slug, query, { KOZIJNEN_PRIJZEN_ACTIEF: "true" }), null);
  assert.equal(priceKozijnOrder("bestaat-niet", query, flags), null);
  assert.equal(priceKozijnOrder(layout.slug, query.replace("b=1000", "b=10"), flags), null);
  const withScreen = new URLSearchParams(query);
  withScreen.set("hor", "inzet");
  assert.equal(priceKozijnOrder(layout.slug, withScreen.toString(), flags), null);
  const ral = new URLSearchParams(query);
  ral.set("kb", "ral");
  assert.equal(priceKozijnOrder(layout.slug, ral.toString(), flags), null);
});

test("mixed draft uses the shop tax mode and the server price", () => {
  const { layout, query } = layoutQuery();
  const priced = priceKozijnOrder(layout.slug, query, flags);
  assert.ok(priced);
  if (!priced) return;
  const kozijn = { ...priced, quantity: 2 };
  const included = buildMixedDraftOrder({
    catalog: [{ variantId: 1001, quantity: 3 }],
    kozijnen: [kozijn],
    email: "test@example.com",
    note: priced.summary,
    noteAttributes: [],
    shippingAddress: address(),
    taxesIncluded: true,
  });
  assert.ok(included);
  const lines = included?.draft_order.line_items ?? [];
  assert.equal(lines[0]?.variant_id, 1001);
  assert.equal(lines[0]?.quantity, 3);
  assert.equal(lines[1]?.price, priced.unitIncl.toFixed(2));
  assert.equal(lines[1]?.quantity, 2);
  assert.notEqual(lines[1]?.price, "1.00");
  assert.equal(included?.draft_order.taxes_included, true);

  const excluded = buildMixedDraftOrder({
    catalog: [],
    kozijnen: [{ ...priced, quantity: 0 }],
    email: "test@example.com",
    note: "",
    noteAttributes: [],
    shippingAddress: address(),
    taxesIncluded: false,
  });
  assert.equal(excluded?.draft_order.line_items[0]?.price, priced.unitExcl.toFixed(2));
  assert.equal(excluded?.draft_order.line_items[0]?.quantity, clampKozijnQty(0));
  assert.equal(secret.test(JSON.stringify(excluded)), false);
});

test("draft order is not created while checkout is off, and fails closed without the tax setting", async () => {
  const { layout, query } = layoutQuery();
  const priced = priceKozijnOrder(layout.slug, query, flags);
  assert.ok(priced);
  if (!priced) return;
  let called = false;
  const off = await createMixedDraftOrder(draftInput(priced), { KOZIJNEN_CHECKOUT_ACTIEF: "false" }, async () => {
    called = true;
    return new Response("{}");
  });
  assert.equal(off.ok, false);
  assert.equal(called, false);

  const env = {
    ...flags,
    SHOPIFY_STORE_DOMAIN: "ajfust-8f.myshopify.com",
    SHOPIFY_ADMIN_ACCESS_TOKEN: "test-token",
  };
  const urls: string[] = [];
  const unread = await createMixedDraftOrder(draftInput(priced), env, async (url) => {
    urls.push(String(url));
    return new Response("no", { status: 401 });
  });
  assert.equal(unread.ok, false);
  if (unread.ok) return;
  assert.equal(unread.reason, "btw");
  assert.equal(urls.some((url) => url.includes("draft_orders")), false);
});

test("checkout posts the engine price for a kozijn and keeps gevel-only carts on the old path", async () => {
  const { layout, query } = layoutQuery();
  const priced = priceKozijnOrder(layout.slug, query, flags);
  assert.ok(priced);
  if (!priced) return;
  const previous = snapshotEnv();
  const originalFetch = globalThis.fetch;
  try {
    process.env.KOZIJNEN_PRIJZEN_ACTIEF = "true";
    process.env.KOZIJNEN_CHECKOUT_ACTIEF = "true";
    process.env.SHOPIFY_STORE_DOMAIN = "ajfust-8f.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "admin-token";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "storefront-token";
    delete process.env.DATABASE_URL;

    const bodies: { url: string; body?: { draft_order?: { line_items?: { price?: string }[] } } }[] = [];
    globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      bodies.push({ url: href, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      if (href.includes("shop.json")) return Response.json({ shop: { taxes_included: true } });
      return Response.json({
        draft_order: { invoice_url: "https://ajfust-8f.myshopify.com/910000/invoices/abc" },
      });
    }) as typeof fetch;

    const result = await createShopifyCheckout({
      lines: [
        {
          productSlug: "kozijn",
          variantSku: "negeer-dit",
          quantity: 2,
          kind: "kozijn",
          kozijnLayout: layout.slug,
          kozijnQuery: query,
          price: 1,
        } as never,
      ],
      customer,
      montage: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.checkoutUrl, /ajfust-8f\.myshopify\.com/);
    assert.equal(bodies.every((call) => call.url.includes("/admin/api/")), true);
    const posted = bodies.find((call) => call.url.includes("draft_orders"));
    assert.equal(posted?.body?.draft_order?.line_items?.[0]?.price, priced.unitIncl.toFixed(2));
    assert.notEqual(posted?.body?.draft_order?.line_items?.[0]?.price, "1.00");

    globalThis.fetch = (async () => {
      throw new Error("storefront mag niet");
    }) as typeof fetch;
    process.env.KOZIJNEN_CHECKOUT_ACTIEF = "true";
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const gevel = await createShopifyCheckout({
      lines: [{ productSlug: "keralit", variantSku: "nee", quantity: 1, kind: "product" }],
      customer,
      montage: false,
    });
    assert.equal(gevel.ok, false);
    if (gevel.ok) return;
    assert.match(gevel.error, /niets besteld/);
    assert.equal(gevel.error.includes("offerte, niet via deze betaling"), false);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv(previous);
  }
});

function draftInput(priced: PricedKozijn) {
  return {
    catalog: [],
    kozijnen: [{ ...priced, quantity: 1 }],
    email: "test@example.com",
    note: priced.summary,
    noteAttributes: [],
    shippingAddress: address(),
  };
}

const ENV_KEYS = [
  "KOZIJNEN_PRIJZEN_ACTIEF",
  "KOZIJNEN_CHECKOUT_ACTIEF",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
  "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  "DATABASE_URL",
] as const;

function snapshotEnv() {
  return new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(previous: Map<(typeof ENV_KEYS)[number], string | undefined>) {
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
