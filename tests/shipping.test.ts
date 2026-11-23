import assert from "node:assert/strict";
import test from "node:test";

import { migratedPosts } from "../src/data/blog/migrated.ts";
import { pageSeo } from "../src/data/seo/category-pages.ts";
import { landingStories } from "../src/data/seo/landings.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import {
  euroPlain,
  exclVat,
  FREE_SHIPPING_FROM,
  inclVat,
  quoteShipping,
  roundMoney,
  SHIPPING_FLAT,
  shippingEstimateBothCopy,
  shippingEstimateCopy,
  shippingEstimateInclCopy,
  shippingPolicyCopy,
} from "../src/lib/format.ts";
import { productJsonLd } from "../src/lib/seo/schema.ts";
import { site } from "../src/lib/site.ts";
import { uspBySection } from "../src/lib/usp.ts";

const EM_DASH = "—";

function variant(price: number): ProductVariant {
  return {
    sku: "TP-1",
    ean: "",
    colorName: "Wit",
    hex: "#ffffff",
    length: "6000 mm",
    price,
    inStock: true,
    colorFamily: "licht",
    sampleId: "TP-1",
  };
}

function product(price: number): Product {
  return {
    slug: "test-paneel",
    name: "Testpaneel",
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: "Paneel voor de verzendtest",
    specs: [],
    relatedSlugs: [],
    variants: [variant(price)],
    price,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "6000 mm",
    images: [],
    profileType: "rabat",
    sampleable: false,
  };
}

test("shipping config is the amount the customer sees, incl. btw", () => {
  assert.equal(SHIPPING_FLAT, 49.95);
  assert.equal(FREE_SHIPPING_FROM, 499);
  assert.equal(site.freeShippingFrom, FREE_SHIPPING_FROM);
  assert.equal(exclVat(SHIPPING_FLAT), roundMoney(49.95 / 1.21));
  assert.equal(exclVat(FREE_SHIPPING_FROM), roundMoney(499 / 1.21));
  assert.equal(exclVat(SHIPPING_FLAT), 41.28);
  assert.equal(exclVat(FREE_SHIPPING_FROM), 412.4);
  assert.notEqual(inclVat(49), SHIPPING_FLAT);
  assert.notEqual(inclVat(499), FREE_SHIPPING_FROM);
});

test("incl copy shows 49,95 and 499, excl copy is those amounts divided by 1,21", () => {
  const incl = shippingEstimateInclCopy();
  const excl = shippingEstimateCopy();
  const both = shippingEstimateBothCopy();
  const policy = shippingPolicyCopy();

  assert.match(incl, /€ 49,95 incl\. btw/);
  assert.match(incl, /€ 499,00 incl\. btw/);
  assert.match(excl, /€ 41,28 excl\. btw/);
  assert.match(excl, /€ 412,40 excl\. btw/);
  assert.match(both, /€ 41,28 excl\. btw \(€ 49,95 incl\. 21% btw\)/);
  assert.match(both, /€ 412,40 excl\. btw \(€ 499,00 incl\. 21% btw\)/);
  assert.match(policy, /€ 49,95 incl\. btw/);
  assert.match(policy, /€ 41,28 excl\. btw/);
  assert.match(policy, /€ 499,00 incl\. btw/);

  for (const copy of [incl, excl, both, policy]) {
    assert.equal(copy.includes("59,29"), false, copy);
    assert.equal(copy.includes("603,79"), false, copy);
    assert.equal(copy.includes(EM_DASH), false, copy);
  }
});

test("cart quote charges the incl rate below €499 incl and nothing from that threshold", () => {
  const below = quoteShipping(0, true);
  assert.equal(below.shippingIncl, 49.95);
  assert.equal(below.shippingExcl, 41.28);
  assert.equal(below.remainingIncl, 499);
  assert.equal(below.remainingExcl, exclVat(499));

  const stillCharged = quoteShipping(400, true);
  assert.equal(inclVat(400), 484);
  assert.equal(stillCharged.shippingIncl, SHIPPING_FLAT);
  assert.equal(stillCharged.remainingIncl, roundMoney(499 - 484));

  const freeOnIncl = quoteShipping(420, true);
  assert.equal(inclVat(420), 508.2);
  assert.equal(freeOnIncl.shippingIncl, 0);
  assert.equal(freeOnIncl.shippingExcl, 0);
  assert.equal(freeOnIncl.remainingIncl, 0);

  const atThreshold = quoteShipping(exclVat(499), true);
  assert.equal(inclVat(exclVat(499)), 499);
  assert.equal(atThreshold.shippingIncl, 0);

  const empty = quoteShipping(0, false);
  assert.equal(empty.shippingIncl, 0);
  assert.equal(empty.remainingIncl, 0);
});

test("schema.org shippingDetails uses the same incl amounts and leaves the product price", () => {
  const price = 90.49;
  const schema = productJsonLd(product(price), "Gevelbekleding");
  const offers = schema.offers as {
    price: string;
    priceSpecification: { price: string; valueAddedTaxIncluded: boolean };
    shippingDetails: {
      shippingDestination: { addressCountry: string };
      shippingRate: {
        shippingRate?: { value: number };
        freeShippingThreshold?: { value: number };
      };
    };
  };

  assert.equal(offers.price, "90.49");
  assert.equal(offers.priceSpecification.price, "90.49");
  assert.equal(offers.priceSpecification.valueAddedTaxIncluded, true);
  assert.equal(offers.shippingDetails.shippingDestination.addressCountry, "NL");
  assert.equal(offers.shippingDetails.shippingRate.shippingRate?.value, 49.95);
  assert.equal(offers.shippingDetails.shippingRate.freeShippingThreshold?.value, 499);

  const json = JSON.stringify(schema);
  assert.equal(json.includes("59.29"), false);
  assert.equal(json.includes("603.79"), false);
  assert.equal(json.includes(EM_DASH), false);
});

test("usp, faq and landing copy share the free-shipping amount", () => {
  const label = euroPlain(FREE_SHIPPING_FROM);
  assert.equal(label, "€499");
  assert.equal(uspBySection.site[0]?.v, `vanaf ${label} binnen Nederland`);

  const blob = JSON.stringify({ pageSeo, landingStories, migratedPosts });
  assert.match(blob, /Gratis verzending vanaf €499/);
  assert.match(blob, /vanaf €499 is de verzending gratis/);
  assert.equal(blob.includes("59,29"), false);
  assert.equal(blob.includes("603,79"), false);
  assert.equal(blob.includes(EM_DASH), false);
});
