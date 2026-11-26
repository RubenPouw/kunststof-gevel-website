import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { CATEGORY_BRAND_COPY, brandsForCategoryStrip } from "../src/lib/catalog/category-brands.ts";
import { staticBrands, staticProducts } from "../src/lib/catalog/static.ts";
import type { Brand, CategorySlug } from "../src/lib/catalog/types.ts";

const BANNED = ["Eko", "Duafort", "Canexel", "Linerio", "Wonderboard"];

function brand(slug: string, name = slug): Brand {
  return { slug, name, summary: "" };
}

function brandsIn(category: CategorySlug): Brand[] {
  const slugs = new Set(staticProducts.filter((product) => product.category === category).map((product) => product.brandSlug));
  return staticBrands.filter((item) => slugs.has(item.slug));
}

test("the strip keeps only the brands that have products in the category", () => {
  const gevel = brandsForCategoryStrip(brandsIn("gevelbekleding"));
  assert.deepEqual(
    gevel.map((item) => item.slug),
    ["eurotexx", "keralit", "kerrafront", "profex", "vinyplus", "zierer"],
  );
  const dakrand = brandsForCategoryStrip(brandsIn("dakranden")).map((item) => item.slug);
  assert.equal(dakrand.includes("milexx"), true);
  assert.equal(dakrand.includes("kerrafront"), false);
  assert.equal(brandsForCategoryStrip(brandsIn("vensterbanken")).map((item) => item.slug).includes("milinboard"), true);
  assert.equal(brandsForCategoryStrip(brandsIn("vensterbanken")).some((item) => item.slug === "keralit"), false);
  assert.deepEqual(brandsForCategoryStrip(brandsIn("hpl-platen")), []);
});

test("blocked brands, the leftover bucket and a repeated slug stay out", () => {
  const tiles = brandsForCategoryStrip([
    brand("keralit", "Keralit"),
    brand("keralit", "Keralit"),
    brand("overig", "Overig"),
    brand("duafort", "Duafort"),
    brand("canexel", "Canexel"),
    brand("linerio", "Linerio"),
    brand("wonderboard", "Wonderboard"),
    brand("eko-rabat", "Eko"),
    brand("zierer", "Zierer"),
  ]);
  assert.deepEqual(
    tiles.map((item) => item.slug),
    ["keralit", "zierer"],
  );
});

test("steenstrips with one brand still link to that brand page", () => {
  const tiles = brandsForCategoryStrip([brand("zierer", "Zierer")]);
  assert.deepEqual(
    tiles.map((item) => item.slug),
    ["zierer"],
  );
});

test("strip copy names the choice and skips banned words", () => {
  const text = Object.values(CATEGORY_BRAND_COPY).join(" ");
  assert.equal(text, "Kies je merk");
  assert.equal(text.includes("—"), false);
  assert.equal(text.includes("–"), false);
  for (const word of BANNED) assert.equal(text.includes(word), false, word);

  const source = readFileSync(new URL("../src/components/catalog/category-brand-strip.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/components/catalog/category-page.tsx", import.meta.url), "utf8");
  const listing = readFileSync(new URL("../src/components/catalog/category-listing.tsx", import.meta.url), "utf8");
  const brandPage = readFileSync(new URL("../src/app/merken/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /\/merken\/\$\{brand\.slug\}/);
  assert.match(source, /CATEGORY_BRAND_COPY\.title/);
  assert.match(source, /kies-je-merk/);
  assert.equal(source.includes("—"), false);
  assert.match(page, /<CategoryBrandStrip/);
  assert.match(listing, /<CategoryBrandStrip/);
  const stripAt = listing.indexOf("<CategoryBrandStrip");
  const hubAt = listing.indexOf("<HplHubPage");
  assert.ok(stripAt > 0 && hubAt > stripAt);
  assert.equal(brandPage.includes("logo=1"), false);
  assert.match(readFileSync(new URL("../src/components/catalog/brand-listing.tsx", import.meta.url), "utf8"), /showLogo = true/);
});

test("the category listing drops the Onze merken carousel and the homepage keeps its bar", () => {
  const products = readFileSync(new URL("../src/components/catalog/product-listing.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.equal(products.includes("BrandRow"), false);
  assert.equal(products.includes("Onze merken"), false);
  assert.match(home, /<BrandMarquee/);
});
