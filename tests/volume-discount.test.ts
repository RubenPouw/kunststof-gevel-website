import assert from "node:assert/strict";
import test from "node:test";

import { quoteOrderDiscount } from "../src/lib/catalog/volume-discount.ts";

test("€1.900 materiaal geeft geen korting", () => {
  const quote = quoteOrderDiscount(1900);
  assert.equal(quote.applied, false);
  assert.equal(quote.discountIncl, 0);
  assert.equal(quote.remainingIncl, 100);
});

test("€2.700 materiaal geeft €75 korting", () => {
  const quote = quoteOrderDiscount(2700);
  assert.equal(quote.applied, true);
  assert.equal(quote.discountIncl, 75);
  assert.equal(quote.remainingIncl, 0);
});

test("de drempel zelf telt mee", () => {
  const quote = quoteOrderDiscount(2000);
  assert.equal(quote.applied, true);
  assert.equal(quote.discountIncl, 75);
});

test("popup50 en Bestelling100 vervangen de €75", () => {
  const quote = quoteOrderDiscount(2700, true);
  assert.equal(quote.applied, false);
  assert.equal(quote.discountIncl, 0);
  assert.equal(quote.remainingIncl, 0);
});
