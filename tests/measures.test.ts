import assert from "node:assert/strict";
import test from "node:test";

import { brandLogoSrc } from "../src/lib/catalog/brand-logos.ts";
import { enrichProduct } from "../src/lib/catalog/derive.ts";
import { filterProductsByQuery } from "../src/lib/catalog/helpers.ts";
import { describeMeasure, parseWorkingWidthMm } from "../src/lib/catalog/measures.ts";
import { productImageAlt } from "../src/lib/shopify/map.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";

function variant(length: string): ProductVariant {
  return {
    sku: "0241-0150",
    ean: "",
    colorName: "Antraciet (A24)",
    hex: "#3A3D41",
    length,
    price: 10,
    inStock: true,
    colorFamily: "donker",
    sampleId: "a24",
  };
}

function item(name: string, length = "stuk") {
  return enrichProduct({
    slug: "artikel",
    name,
    vendor: "Test",
    brand: "Test",
    brandSlug: "test",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [variant(length)],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length,
    images: [],
    profileType: "overig",
    sampleable: false,
    source: "shopify",
  } satisfies Product);
}

test("working width ignores accessory thicknesses and keeps the panel face", () => {
  assert.equal(parseWorkingWidthMm("Florence buitenplafond paneel 250x16,5 mm"), 250);
  assert.equal(parseWorkingWidthMm("Platpaneel 150x9mm"), 150);
  assert.equal(parseWorkingWidthMm("Unipanel bouwpaneel 185x16mm"), 185);
  assert.equal(parseWorkingWidthMm("Unipanel bouwpaneel 610x16mm"), 610);
  assert.equal(parseWorkingWidthMm("Milexx Rabatdeel 150 mm"), 150);
  assert.equal(parseWorkingWidthMm("Zierer leisteenplaat 1096x359 mm"), 359);
  assert.equal(parseWorkingWidthMm("Volschuim afwerkprofiel 68x8 mm"), undefined);
  assert.equal(parseWorkingWidthMm("Kerrafront 2-delig hoekprofiel 17 mm inwendig"), undefined);
  assert.equal(parseWorkingWidthMm("Startprofiel 51x14x1 mm staal"), undefined);
  assert.equal(parseWorkingWidthMm("Milin loodvervanger bitumen 300 mm 5 mtr"), undefined);
  assert.equal(parseWorkingWidthMm("Profol PE Folie 150mu 4.00x50m1"), undefined);
  assert.equal(parseWorkingWidthMm("Bevestigingsschroeven 3x35mm 500st"), undefined);
  assert.equal(parseWorkingWidthMm("Wonderboard 4000x1200x2,3 mm structuur"), undefined);
  assert.equal(
    parseWorkingWidthMm("Vinyplus Rondkantpaneel 150 mm", [{ label: "Werkende breedte", value: "150 mm" }]),
    150,
  );
});

test("cards label width, length and profile size separately", () => {
  const rabat = item("Milexx Rabatdeel 150 mm", "150 mm");
  assert.equal(rabat.productGroup, "gevelpaneel");
  assert.equal(rabat.workingWidthMm, 150);
  assert.equal(rabat.variants[0]?.length, "6 m");
  assert.equal(describeMeasure(rabat.name, rabat.variants[0]?.length ?? "", rabat.workingWidthMm).label, "Lengte");

  const hoek = item("Kerrafront 2-delig hoekprofiel 17 mm inwendig", "17 mm");
  assert.equal(hoek.productGroup, "afwerkprofiel");
  assert.equal(hoek.workingWidthMm, undefined);
  assert.equal(hoek.variants[0]?.length, "stuk");
  assert.deepEqual(describeMeasure(hoek.name, "stuk"), { label: "Inwendig", text: "17 mm" });

  const profiel = item("Volschuim afwerkprofiel 68x8 mm", "8 mm");
  assert.equal(profiel.workingWidthMm, undefined);
  assert.deepEqual(describeMeasure(profiel.name, "stuk"), { label: "Maat", text: "68×8 mm" });

  const linerio = item("Linerio eindprofiel M 2650x26x12 mm", "12 mm");
  assert.equal(linerio.workingWidthMm, undefined);
  assert.equal(linerio.variants[0]?.length, "2650 mm");
  assert.equal(describeMeasure(linerio.name, "2650 mm").text, "2.650 mm");

  const florence = item("Florence buitenplafond paneel 250x16,5 mm", "6 m");
  assert.equal(florence.workingWidthMm, 250);
  assert.equal(florence.variants[0]?.length, "6 m");

  const lood = item("Milin loodvervanger bitumen 300 mm 5 mtr", "300 mm");
  assert.equal(lood.productGroup, "toebehoren");
  assert.equal(lood.workingWidthMm, undefined);
  assert.equal(lood.variants[0]?.length, "5 m");

  const folie = item("Profol PE Folie 150mu 4.00x50m1");
  assert.equal(folie.productGroup, "toebehoren");
  assert.equal(folie.workingWidthMm, undefined);

  const lamina = item("Lamina 110 260 cm rol a 50 meter", "260 cm");
  assert.equal(lamina.productGroup, "toebehoren");
  assert.equal(lamina.variants[0]?.length, "2,6 m");

  const tape = item("Wonderboard maskingtape 30 mm rol 33 mtr", "30 mm");
  assert.equal(tape.workingWidthMm, undefined);
  assert.equal(tape.variants[0]?.length, "33 m");

  const tile = item("Zierer leisteenplaat 1096x359 mm (3,4m2)", "359 mm");
  assert.equal(tile.productGroup, "gevelpaneel");
  assert.equal(tile.workingWidthMm, 359);
  assert.equal(tile.variants[0]?.length, "1096 mm");

  const corner = item("Zierer hoekstuk 359 mm grof", "359 mm");
  assert.equal(corner.productGroup, "afwerkprofiel");
  assert.equal(corner.workingWidthMm, undefined);
});

test("preview titles no longer feed 1 to 40 mm into the width filter", () => {
  const titles = [
    "Milexx Rabatdeel 150 mm",
    "Volschuim afwerkprofiel 68x8 mm",
    "Kerrafront Trend gevelpaneel 320 mm structuur",
    "Kerrafront 2-delig hoekprofiel 17 mm inwendig",
    "Startprofiel 51x14x1 mm staal",
    "Profol PE Folie 150mu 4.00x50m1",
    "Milin loodvervanger bitumen 300 mm 5 mtr",
    "Lamina 110 260 cm rol a 50 meter",
    "Wonderboard maskingtape 30 mm rol 33 mtr",
    "Bevestigingsschroeven 3x35mm 500st",
    "Florence buitenplafond paneel 250x16,5 mm",
    "Platpaneel 150x9mm",
    "Unipanel bouwpaneel 185x16mm",
    "Linerio wandpaneel S 115mm",
    "Linerio eindprofiel M 2650x26x12 mm",
    "Afdekgevellijst 10mm",
    "Paneelvulling 125x24mm",
    "Sponningschroot 100x10mm",
    "Wonderboard 4000x1200x2,3 mm structuur",
  ];
  for (const title of titles) {
    const width = parseWorkingWidthMm(title);
    assert.ok(width === undefined || width >= 80, `${title} → ${width}`);
    const group = item(title).productGroup;
    assert.ok(group === "gevelpaneel" || group === "afwerkprofiel" || group === "toebehoren", title);
  }
});

test("a url alt falls back to the product name", () => {
  assert.equal(
    productImageAlt("https://cdn.shopify.com/s/files/profol.jpg", "Profol PE Folie 150mu"),
    "Profol PE Folie 150mu",
  );
  assert.equal(productImageAlt("Profol PE folie op rol", "Profol PE Folie"), "Profol PE folie op rol");
});

test("missing brand marks resolve to a wordmark file", () => {
  for (const slug of ["keralit", "florence", "heering", "unipanel"]) {
    assert.match(brandLogoSrc(slug) ?? "", /\/brand\/merken\//);
  }
});

test("search matches a colour code and an article number without dashes", () => {
  const product = item("Milexx Rabatdeel 150 mm", "6 m");
  assert.equal(filterProductsByQuery([product], "A24").length, 1);
  assert.equal(filterProductsByQuery([product], "02410150").length, 1);
  assert.equal(filterProductsByQuery([product], "rabatdeel").length, 1);
  assert.equal(filterProductsByQuery([product], "geen-hit").length, 0);
});
