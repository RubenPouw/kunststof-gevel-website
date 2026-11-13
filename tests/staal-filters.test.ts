import assert from "node:assert/strict";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import { isBannedSampleProduct } from "../src/lib/staal/banned.ts";
import { applyFillout } from "../src/lib/staal/fillout.ts";
import { STAAL_FILTER_ALL, staalFilterFacets, staalGroupVisible } from "../src/lib/staal/filters.ts";
import { staalPickerSections } from "../src/lib/staal/picker.ts";
import { buildStaalTree } from "../src/lib/staal/tree.ts";

const brandBySlug = Object.fromEntries(
  staticProducts
    .filter((product) => product.brandSlug && !isBannedSampleProduct(product))
    .map((product) => [product.slug, { id: product.brandSlug, label: product.brand }]),
);

const groups = staalPickerSections(applyFillout(buildStaalTree(staticProducts)), brandBySlug).flatMap(
  (section) => section.groups,
);
const facets = staalFilterFacets(groups);
const banned = /duafort|profex|canexel|linerio|wonderboard/i;

test("staal filters come from the samples that are actually there", () => {
  assert.deepEqual(
    facets.categories.map((item) => [item.label, item.swatches]),
    [
      ["Potdeksel", 44],
      ["Sponning", 135],
      ["Rabat", 32],
      ["Vario", 5],
      ["Multisponning", 23],
      ["Steenstrip", 11],
      ["Modern Wood", 5],
      ["Dakranden", 52],
      ["Vensterbanken", 3],
    ],
  );
  assert.deepEqual(
    facets.brands.map((item) => [item.label, item.swatches]),
    [
      ["Keralit", 147],
      ["VinyPlus", 98],
      ["Eurotexx", 26],
      ["Kerrafront", 20],
      ["Zierer", 11],
      ["Milexx", 5],
      ["Milinboard", 3],
    ],
  );
  assert.equal(
    facets.categories.reduce((sum, item) => sum + item.swatches, 0),
    groups.reduce((sum, group) => sum + group.swatches.length, 0),
  );
  assert.equal(groups.every((group) => group.brandId), true);
  assert.equal(facets.categories.some((item) => item.id === "hpl" || item.id === "plafond"), false);
});

test("category and brand filters combine, and Alle shows every sample", () => {
  const all = groups.filter((group) => staalGroupVisible(group, STAAL_FILTER_ALL, STAAL_FILTER_ALL));
  assert.equal(all.length, groups.length);

  const keralitSponning = groups.filter((group) => staalGroupVisible(group, "sponning", "keralit"));
  assert.deepEqual(
    keralitSponning.map((group) => group.swatches.length),
    [42, 28, 28],
  );
  assert.equal(
    groups.filter((group) => staalGroupVisible(group, "vensterbank", "keralit")).length,
    0,
  );
  assert.equal(
    groups.filter((group) => staalGroupVisible(group, "vario", "vinyplus")).reduce((sum, group) => sum + group.swatches.length, 0),
    5,
  );
  assert.equal(
    groups.filter((group) => staalGroupVisible(group, "vensterbank", STAAL_FILTER_ALL)).reduce((sum, group) => sum + group.swatches.length, 0),
    3,
  );
});

test("banned names are not a sample, a category or a brand", () => {
  const blob = groups
    .flatMap((group) => [group.title, group.categoryLabel, group.brandLabel, ...group.swatches.map((swatch) => `${swatch.name} ${swatch.lineLabel}`)])
    .join("\n");
  assert.equal(banned.test(blob), false);
  for (const label of [...facets.categories, ...facets.brands].map((item) => item.label)) {
    assert.equal(label.includes("\u2014") || label.includes("\u2013"), false, label);
    assert.equal(banned.test(label), false, label);
  }
  const venster = facets.categories.find((item) => item.id === "vensterbank");
  assert.equal(venster?.label, "Vensterbanken");
  assert.equal(/buiten/i.test(venster?.label ?? ""), false);
});
