import assert from "node:assert/strict";
import test from "node:test";

import { labelColour } from "../src/lib/catalog/colours.ts";
import { listSampleColors } from "../src/lib/catalog/derive.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { isBlankSampleName, sampleLineLabel, tidySampleName } from "../src/lib/staal/labels.ts";
import { addStaalPick, picksToLines, removeStaalPick, STAAL_PICK_LIMIT, staalPickerSections, type StaalSwatch } from "../src/lib/staal/picker.ts";
import { buildStaalTree } from "../src/lib/staal/tree.ts";

function swatch(id: string, path: string[] = ["gevel", id], colorId = id): StaalSwatch {
  return {
    id,
    path,
    colorId,
    name: id,
    lineLabel: "Keralit",
    productSlugs: [id],
  };
}

test("an empty catalog does not invent a colour card", () => {
  assert.deepEqual(staalPickerSections(buildStaalTree([])), []);
});

test("a sample fills the next slot and stops at four", () => {
  let slots = addStaalPick([], swatch("a"));
  assert.deepEqual(slots.map((slot) => slot.id), ["a"]);
  slots = addStaalPick(slots, swatch("a"));
  assert.equal(slots.length, 1);
  slots = addStaalPick(slots, swatch("b"));
  slots = addStaalPick(slots, swatch("c"));
  slots = addStaalPick(slots, swatch("d"));
  slots = addStaalPick(slots, swatch("e"));
  assert.equal(slots.length, STAAL_PICK_LIMIT);
  assert.deepEqual(slots.map((slot) => slot.id), ["a", "b", "c", "d"]);
  slots = removeStaalPick(slots, "b");
  assert.deepEqual(slots.map((slot) => slot.id), ["a", "c", "d"]);
  slots = addStaalPick(slots, swatch("e"));
  assert.deepEqual(slots.map((slot) => slot.id), ["a", "c", "d", "e"]);
});

test("slots of one product line become one aanvraag line", () => {
  const lines = picksToLines([
    swatch("antraciet", ["gevel", "keralit"], "antraciet"),
    swatch("wit", ["gevel", "keralit"], "wit"),
    swatch("eiken", ["dakrand", "milexx"], "eiken"),
  ]);
  assert.equal(lines.length, 2);
  assert.deepEqual(lines[0], { path: ["gevel", "keralit"], colorIds: ["antraciet", "wit"] });
  assert.deepEqual(lines[1], { path: ["dakrand", "milexx"], colorIds: ["eiken"] });
});

test("Default Title is not a colour and folie is not labeled HPL", () => {
  assert.equal(tidySampleName("Milyt mm Default Title"), "Milyt");
  assert.equal(isBlankSampleName("Milyt mm Default Title"), true);
  assert.equal(tidySampleName("Antraciet mm Default Title"), "Antraciet");
  assert.equal(sampleLineLabel("Wit (folie) (F39)", "Milyt HPL plaat 6 mm HPL"), "Milyt");
  assert.equal(sampleLineLabel("Creme (folie) (B42)", "Milyt HPL plaat HPL"), "Milyt");
  assert.equal(sampleLineLabel("Antraciet (folie) (A35)", "Milyt HPL plaat HPL"), "Milyt");
  assert.equal(sampleLineLabel("Groen (folie) (C89)", "Milyt HPL plaat HPL"), "Milyt");
  assert.equal(sampleLineLabel("Blauw (folie) (A64)", "Milyt HPL plaat HPL"), "Milyt");
  assert.equal(sampleLineLabel("Wit (folie) (F39)", "HPL"), "Folie");
  assert.equal(sampleLineLabel(labelColour("F39"), "Flexinplex plaat HPL"), "Flexinplex");

  const product = {
    slug: "milyt-hpl-plaat-6",
    name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
    vendor: "HPL",
    brand: "HPL",
    brandSlug: "hpl",
    category: "hpl-platen",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [
      { name: "Wit (folie) (F39)", hex: "#fff", family: "licht", sampleId: "hpl:wit" },
      { name: "Milyt mm Default Title", hex: "#ccc", family: "overig", sampleId: "hpl:leeg" },
    ],
    length: "stuk",
    images: [],
    profileType: "overig",
    sampleable: true,
  } satisfies Product;
  const samples = listSampleColors([product]);
  assert.equal(samples.length, 1);
  assert.equal(samples[0]?.colorName, "Wit (folie) (F39)");
  assert.equal(samples[0]?.brandName, "Milyt");
  assert.equal(sampleLineLabel("Antraciet", "Keralit potdeksel 143 mm", "Keralit"), "Keralit");
});

function variant(colorName: string): ProductVariant {
  return {
    sku: colorName,
    ean: "",
    colorName,
    hex: "#333333",
    length: "1 m",
    price: 10,
    inStock: true,
    colorFamily: "overig",
    sampleId: `test:${colorName}`,
  };
}

function product(partial: Partial<Product> & Pick<Product, "slug" | "name">): Product {
  return {
    vendor: "Test",
    brand: "Test",
    brandSlug: "test",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [variant("Antraciet")],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "1 m",
    images: [],
    profileType: "potdeksel",
    sampleable: true,
    ...partial,
  };
}

test("the picker groups lines and labels folie as Milyt, without Default Title", () => {
  const tree = buildStaalTree([
    product({
      slug: "keralit-potdeksel",
      name: "Keralit potdeksel 143 mm",
      brand: "Keralit",
      brandSlug: "keralit",
      variants: [variant("Antraciet"), variant("Creme")],
    }),
    product({
      slug: "milyt-hpl-plaat-6",
      name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
      brand: "HPL",
      brandSlug: "hpl",
      category: "hpl-platen",
      saleUnit: "sheet",
      variants: [
        variant("Wit (folie) (F39)"),
        variant("Creme (folie) (B42)"),
        variant("Antraciet (folie) (A35)"),
        variant("Groen (folie) (C89)"),
        variant("Blauw (folie) (A64)"),
        variant("Milyt mm Default Title"),
      ],
    }),
  ]);
  const sections = staalPickerSections(tree);
  const gevel = sections.find((section) => section.id === "gevel");
  assert.equal(gevel?.groups.some((group) => group.title.includes("Potdeksel") && group.title.includes("Keralit")), true);
  const hpl = sections.find((section) => section.id === "hpl");
  const names = hpl?.groups.flatMap((group) => group.swatches.map((swatch) => `${swatch.name}|${swatch.lineLabel}`)) ?? [];
  assert.equal(names.some((name) => /default title/i.test(name)), false);
  assert.equal(names.some((name) => name.startsWith("Milyt|")), false);
  for (const name of ["Wit (folie)", "Creme (folie)", "Antraciet (folie)", "Groen (folie)", "Blauw (folie)"]) {
    assert.equal(
      names.some((entry) => entry.startsWith(`${name}|Milyt`)),
      true,
      name,
    );
  }
});
