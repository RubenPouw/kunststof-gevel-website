import assert from "node:assert/strict";
import test from "node:test";

import colourCodes from "../src/data/catalog/colour-codes.json" with { type: "json" };
import {
  colourOptionText,
  compareColourLabels,
  labelColour,
  UNVERIFIED_COLOUR_CODES,
} from "../src/lib/catalog/colours.ts";
import { applyColourLabels, enrichProduct } from "../src/lib/catalog/derive.ts";
import { applyListingFilters, filterProductsByQuery } from "../src/lib/catalog/helpers.ts";
import { toListingCard } from "../src/lib/catalog/listing.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";

const BARE_CODE = /^(?:[A-G]\d{2}|\d{3})$/;

function variant(colorName: string, sku = colorName): ProductVariant {
  return {
    sku,
    ean: "",
    colorName,
    hex: "#C5C1B8",
    length: "6 m",
    price: 80,
    inStock: true,
    options: [{ name: "Kleur", value: colorName }],
    colorFamily: "overig",
    sampleId: `test:${colorName}`,
  };
}

function product(variants: ProductVariant[]): Product {
  return {
    slug: "vinyplus-rabat",
    name: "VinyPlus rabat",
    vendor: "Milin",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants,
    price: 80,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "6 m",
    images: [],
    profileType: "rabat",
    sampleable: true,
    source: "shopify",
  };
}

test("every rendered colour option has a name, except unverified codes", () => {
  const unverified = new Set(UNVERIFIED_COLOUR_CODES);
  const codes = Object.keys(colourCodes);
  const enriched = enrichProduct(product(codes.map((code) => variant(code))));
  const card = toListingCard(enriched);
  const options = card.swatches.map((swatch) => colourOptionText(swatch.name));

  assert.equal(options.length, codes.length);
  assert.equal(labelColour("A99 (04858001)"), "Cappuccino (folie) (A99)");
  assert.equal(labelColour("B42 (05794261)"), "Creme (folie) (B42)");
  assert.equal(labelColour("F39 (05794161)"), "Wit (folie) (F39)");
  for (const option of options) {
    if (BARE_CODE.test(option)) {
      assert.ok(unverified.has(option), `bare colour option ${option}`);
      continue;
    }
    assert.match(option, /^.+ \((?:[A-G]\d{2}|\d{3})\)$/, option);
    assert.equal(BARE_CODE.test(option), false, option);
  }

  const sorted = [...options].sort(compareColourLabels);
  const aluminium = sorted.findIndex((option) => option.startsWith("Aluminium"));
  const antraciet = sorted.findIndex((option) => option === "Antraciet (A24)");
  const claystone = sorted.findIndex((option) => option.startsWith("Claystone"));
  assert.ok(aluminium >= 0 && antraciet > aluminium && claystone > antraciet);

  assert.equal(labelColour("A24"), "Antraciet (A24)");
  assert.equal(unverified.size, 0);
});

test("search and filters match the colour name and the code", () => {
  const enriched = enrichProduct(product([variant("A24", "03200460"), variant("B42", "04014260")]));
  assert.equal(enriched.colors.map((color) => color.name).sort().join("|"), "Antraciet (A24)|Creme (folie) (B42)");
  assert.equal(applyListingFilters([enriched], { colorSlug: "a24" }).length, 1);
  assert.equal(applyListingFilters([enriched], { colorSlug: "antraciet" }).length, 1);
  assert.equal(applyListingFilters([enriched], { colorSlug: "antraciet-a24" }).length, 1);
  assert.equal(applyListingFilters([enriched], { colorSlug: "b42" }).length, 1);
  assert.equal(applyListingFilters([enriched], { colorSlug: "creme-folie" }).length, 1);
  assert.equal(filterProductsByQuery([enriched], "A24").length, 1);
  assert.equal(filterProductsByQuery([enriched], "Antraciet").length, 1);
  assert.equal(filterProductsByQuery([enriched], "B42").length, 1);
  assert.equal(filterProductsByQuery([enriched], "folie").length, 1);
});

test("a stored catalogue row with a bare code is labeled on read", () => {
  const stored = product([variant("A24", "03200460")]);
  const labeled = applyColourLabels(stored);
  assert.equal(labeled.variants[0]?.colorName, "Antraciet (A24)");
  assert.equal(labeled.variants[0]?.options?.[0]?.value, "Antraciet (A24)");
  assert.equal(labeled.colors[0]?.name, "Antraciet (A24)");
  assert.equal(labeled.variants[0]?.colorFamily, "donker");
  assert.equal(labeled.variants[0]?.hex.toLowerCase(), "#3a3d41");
});
