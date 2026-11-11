import assert from "node:assert/strict";
import test from "node:test";

import { quoteOrderDiscount, stackCodeDiscount } from "../src/lib/catalog/volume-discount.ts";

test("€1.900 materiaal geeft geen korting", () => {
  const quote = quoteOrderDiscount(1900);
  assert.equal(quote.applied, false);
  assert.equal(quote.discountIncl, 0);
  assert.equal(quote.remainingIncl, 100);
});

test("€2.700 materiaal geeft 2,5% korting, €67,50", () => {
  const quote = quoteOrderDiscount(2700);
  assert.equal(quote.applied, true);
  assert.equal(quote.discountIncl, 67.5);
  assert.equal(quote.remainingIncl, 0);
});

test("de drempel zelf telt mee", () => {
  const quote = quoteOrderDiscount(2000);
  assert.equal(quote.applied, true);
  assert.equal(quote.discountIncl, 50);
});

test("een code van €50 of €100 komt bovenop de 2,5%", () => {
  const above = quoteOrderDiscount(2700);
  assert.equal(stackCodeDiscount(above, 50).discountIncl, 117.5);
  assert.equal(stackCodeDiscount(above, 100).discountIncl, 167.5);
  const below = quoteOrderDiscount(1900);
  assert.equal(stackCodeDiscount(below, 50).discountIncl, 50);
  assert.equal(stackCodeDiscount(below, 100).discountIncl, 100);
});
