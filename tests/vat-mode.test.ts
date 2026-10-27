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

test("shipping copy uses the configured amounts and 21 percent", () => {
  assert.match(shippingEstimateInclCopy(), new RegExp(inclVat(SHIPPING_FLAT).toLocaleString("nl-NL")));
  assert.match(shippingEstimateInclCopy(), new RegExp(inclVat(FREE_SHIPPING_FROM).toLocaleString("nl-NL")));
  assert.match(shippingEstimateBothCopy(), /49,00/);
  assert.match(shippingEstimateBothCopy(), /499,00/);
  assert.match(shippingEstimateBothCopy(), /incl\. 21% btw/);
  assert.equal(shippingEstimateBothCopy().includes("—"), false);
  assert.equal(exclVat(121), 100);
});
