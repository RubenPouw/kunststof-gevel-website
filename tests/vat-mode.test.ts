import assert from "node:assert/strict";
import test from "node:test";

import {
  exclVat,
  inclVat,
  SHIPPING_FLAT,
  FREE_SHIPPING_FROM,
  shippingEstimateBothCopy,
  shippingEstimateInclCopy,
} from "../src/lib/format.ts";
import { readVatMode, VAT_BOOT_SCRIPT, VAT_COOKIE, VAT_STORAGE } from "../src/lib/vat-mode.ts";

test("btw choice defaults to incl and reads the cookie", () => {
  assert.equal(readVatMode(null), "incl");
  assert.equal(readVatMode(""), "incl");
  assert.equal(readVatMode("kg_consent=granted"), "incl");
  assert.equal(readVatMode(`${VAT_COOKIE}=excl`), "excl");
  assert.equal(readVatMode(`foo=1; ${VAT_COOKIE}=incl`), "incl");
  assert.equal(readVatMode(`${VAT_COOKIE}=excl; kg_consent=granted`), "excl");
});

test("boot script sets the mode before paint and keeps cookie and storage together", () => {
  assert.match(VAT_BOOT_SCRIPT, new RegExp(VAT_COOKIE));
  assert.match(VAT_BOOT_SCRIPT, new RegExp(VAT_STORAGE));
  assert.match(VAT_BOOT_SCRIPT, /dataset\.btw/);
  assert.match(VAT_BOOT_SCRIPT, /incl/);
  assert.equal(VAT_BOOT_SCRIPT.includes("—"), false);
});

test("shipping copy uses the customer incl amounts and derives excl by dividing", () => {
  assert.equal(SHIPPING_FLAT, 49.95);
  assert.equal(FREE_SHIPPING_FROM, 499);
  assert.match(shippingEstimateInclCopy(), /49,95/);
  assert.match(shippingEstimateInclCopy(), /499,00/);
  assert.equal(shippingEstimateInclCopy().includes("59,29"), false);
  assert.equal(shippingEstimateInclCopy().includes("603,79"), false);
  assert.match(shippingEstimateBothCopy(), /41,28/);
  assert.match(shippingEstimateBothCopy(), /412,40/);
  assert.match(shippingEstimateBothCopy(), /49,95/);
  assert.match(shippingEstimateBothCopy(), /incl\. 21% btw/);
  assert.equal(shippingEstimateBothCopy().includes("—"), false);
  assert.equal(exclVat(121), 100);
  assert.notEqual(inclVat(SHIPPING_FLAT), SHIPPING_FLAT);
});
