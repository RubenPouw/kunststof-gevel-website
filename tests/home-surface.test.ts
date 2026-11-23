import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { businessPoints, footerColumns, site } from "../src/lib/site.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("header drops the landline, renames samples, and uses signal yellow", () => {
  const header = read("../src/components/site-header.tsx");
  assert.equal(header.includes("site.phone"), false);
  assert.equal(header.includes("030 227 1397"), false);
  assert.match(header, /Gratis Samples/);
  assert.equal(/>Stalen</.test(header), false);
  assert.equal(header.includes("hover:bg-kg-navy-2"), false);
  assert.equal(header.includes("hover:bg-kg-kalk"), false);
  assert.match(header, /hover:bg-kg-signal hover:text-kg-navy/);
  assert.match(header, /Winkelwagen/);
});

test("footer keeps a visible tel link and renames projecten", () => {
  const footer = read("../src/components/site-footer.tsx");
  assert.match(footer, /href=\{site\.phoneHref\}/);
  assert.match(footer, /text-\[20px\]/);
  assert.equal(site.phone, "030 227 1397");
  assert.equal(site.phoneHref, "tel:+31302271397");
  const bedrijf = footerColumns.find((column) => column.title === "Bedrijf");
  const projecten = bedrijf?.links.find((link) => link.href === "/projecten");
  assert.equal(projecten?.label, "Montage projecten");
});

test("samples panel is one navy and the montage line says monteren", () => {
  const samples = read("../src/components/home/samples-section.tsx");
  assert.equal(samples.includes("bg-kg-navy-2"), false);
  assert.match(samples, /bg-kg-navy/);
  const band = read("../src/components/home/business-band.tsx");
  assert.match(band, /Ook laten monteren\?/);
  assert.equal(band.includes("laten zetten"), false);
  assert.match(band, /Bestelt u voor uw zaak\?/);
  assert.match(band, /href="\/zakelijk"/);
  assert.deepEqual(businessPoints, [
    "Zakelijk kopen met voordeel",
    "Bestellen op rekening is mogelijk",
    "Gemakkelijk herbestellen",
  ]);
  assert.match(band, /✓/);
});

test("HPL category uses the shared listing and keeps the colour hub", () => {
  const page = read("../src/app/hpl-plaat/page.tsx");
  const listing = read("../src/components/catalog/category-listing.tsx");
  assert.match(page, /CategoryListing/);
  assert.match(page, /slug="hpl-platen"/);
  assert.match(listing, /HplHubPage/);
  assert.match(listing, /id="kleur-en-structuur"|embedded/);
  assert.match(listing, /photoGrid=\{slug === "hpl-platen"\}/);
  const products = read("../src/components/catalog/product-listing.tsx");
  assert.match(products, /minmax\(0,3fr\)_minmax\(0,9fr\)/);
  assert.match(products, /photoGrid \? \(\s*<ListingPhotoGrid/);
  const defaults = read("../src/lib/catalog/listing.ts");
  assert.match(defaults, /view: "lijst"/);
  const gevel = read("../src/app/gevelbekleding/page.tsx");
  assert.equal(gevel.includes("photoGrid"), false);
});

test("listing rows keep a readable name and aligned controls", () => {
  const row = read("../src/components/catalog/listing-row.tsx");
  assert.equal(row.includes("lg:contents"), false);
  assert.match(row, /min-w-0 flex-1/);
  assert.match(row, /break-words/);
  assert.match(row, /@min-\[640px\]:grid-cols-\[minmax\(7\.5rem,1fr\)_7\.5rem_8\.5rem_10\.5rem\]/);
  const listing = read("../src/components/catalog/category-listing.tsx");
  assert.match(listing, /photoGrid=\{slug === "hpl-platen"\}/);
  const products = read("../src/components/catalog/product-listing.tsx");
  assert.match(products, /photoGrid \? \(\s*<ListingPhotoGrid/);
  assert.match(products, /<ListingRow/);
});

test("category cards are a carousel of packshots in the fixed order", () => {
  const grid = read("../src/components/home/assortment-grid.tsx");
  assert.equal(grid.includes("/categorie/gevelbekleding.webp"), false);
  assert.equal(grid.includes("/categorie/kozijnen.webp"), false);
  assert.equal(grid.includes("duafort"), false);
  assert.equal(grid.includes("profex"), false);
  assert.equal(grid.includes("canexel"), false);
  assert.equal(grid.includes("linerio"), false);
  assert.equal(grid.includes("wonderboard"), false);
  assert.match(grid, /aria-label="Vorige categorieën"/);
  assert.match(grid, /aria-label="Volgende categorieën"/);
  assert.match(grid, /aspect-\[4\/3\]/);
  assert.match(grid, /fit="contain"/);
  const names = [...grid.matchAll(/name: "([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(names, [
    "Gevelbekleding",
    "Kunststof kozijnen",
    "Dakranden",
    "HPL platen",
    "Plafondpanelen",
    "Bevestiging",
  ]);
});
