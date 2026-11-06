import assert from "node:assert/strict";
import test from "node:test";

import { ceilingPlaceOf } from "../src/lib/catalog/ceiling.ts";
import { applyListingFilters, listingFacets, listingHref, parseListingSearchParams } from "../src/lib/catalog/helpers.ts";
import { prepareListing } from "../src/lib/catalog/listing.ts";
import { listingRewriteTarget } from "../src/lib/catalog/paths.ts";
import { labelForProductGroup, type Product } from "../src/lib/catalog/types.ts";
import { productNav, shopNav } from "../src/lib/site.ts";

const CATEGORY_HREFS = [
  "/gevelbekleding",
  "/plafondpanelen",
  "/dakranden",
  "/hpl-plaat",
  "/kunststof-kozijnen",
  "/kozijnafwerking",
  "/montage",
];

test("categories sit under Producten and are not loose top links", () => {
  const underProducts = productNav.map((item) => item.href);
  for (const href of CATEGORY_HREFS) {
    assert.equal(underProducts.includes(href), true, href);
  }
  const top = shopNav.map((item) => item.href);
  for (const href of CATEGORY_HREFS) {
    assert.equal(top.includes(href), false, href);
  }
  assert.deepEqual(top, ["/merken", "/projecten", "/zakelijk"]);
  assert.equal(productNav[0]?.label, "Gevelbekleding");
  assert.equal(productNav[1]?.label, "Plafondpanelen");
  assert.equal(productNav[2]?.label, "Dakranden");
  assert.equal(productNav[3]?.label, "HPL platen");
});

test("plafond panel group is labeled Plafondpanelen", () => {
  assert.equal(labelForProductGroup("gevelpaneel", "/plafondpanelen"), "Plafondpanelen");
  assert.equal(labelForProductGroup("gevelpaneel", "/gevelbekleding"), "Gevelpanelen");
  assert.equal(labelForProductGroup("afwerkprofiel", "/plafondpanelen"), "Afwerkprofielen");
});

function ceilingProduct(slug: string, name = slug, extra: Partial<Product> = {}): Product {
  return {
    slug,
    name,
    vendor: "Florence",
    brand: "Florence",
    brandSlug: "florence",
    category: "plafondpanelen",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "stuk",
    images: [],
    profileType: "overig",
    sampleable: false,
    ...extra,
  };
}

test("Florence place comes from the name, then tags, then the explicit thickness map", () => {
  assert.equal(
    ceilingPlaceOf(ceilingProduct("florence-binnenplafond-paneel-250x10mm", "Florence binnenplafond paneel 250x10mm")),
    "binnen",
  );
  assert.equal(
    ceilingPlaceOf(
      ceilingProduct("florence-buitenplafond-paneel-250x16-5-mm", "Florence buitenplafond paneel 250x16,5 mm"),
    ),
    "buiten",
  );
  assert.equal(
    ceilingPlaceOf(ceilingProduct("startprofiel-2-dl-florence-buitenplafond", "Startprofiel 2-dl Florence buitenplafond")),
    "buiten",
  );
  assert.equal(ceilingPlaceOf(ceilingProduct("florence-h-verbindingprofiel-16-5mm", "Florence H-verbindingprofiel 16,5 mm")), "buiten");
  assert.equal(ceilingPlaceOf(ceilingProduct("florence-omrandingprofiel-10mm-2-delig", "Florence omrandingprofiel 10mm")), "binnen");
  assert.equal(ceilingPlaceOf(ceilingProduct("florence-knikhoekprofiel-10mm", "Florence knikhoekprofiel 10mm")), "binnen");
  assert.equal(ceilingPlaceOf(ceilingProduct("florence-plafondplint-35x6mm-2-delig", "Florence plafondplint 35x6mm")), undefined);

  const tagged = ceilingProduct("florence-los-profiel", "Florence profiel", { tags: ["buiten"] });
  assert.equal(ceilingPlaceOf(tagged), "buiten");
  const titled = ceilingProduct("florence-binnenplafond-paneel-250x10mm", "Florence binnenplafond paneel", {
    tags: ["buiten"],
  });
  assert.equal(ceilingPlaceOf(titled), "binnen");
});

test("plek filters the ceiling list and round-trips in the url", () => {
  const binnen = ceilingProduct("florence-binnenplafond-paneel-250x10mm", "Florence binnenplafond paneel");
  const buiten = ceilingProduct("florence-buitenplafond-paneel-250x16-5-mm", "Florence buitenplafond paneel");
  const unknown = ceilingProduct("florence-plafondplint-35x6mm-2-delig", "Florence plafondplint 35x6mm");
  const list = [binnen, buiten, unknown];

  assert.deepEqual(
    applyListingFilters(list, { ceilingPlace: "binnen" }).map((item) => item.slug),
    ["florence-binnenplafond-paneel-250x10mm"],
  );
  assert.deepEqual(
    applyListingFilters(list, { ceilingPlace: "buiten" }).map((item) => item.slug),
    ["florence-buitenplafond-paneel-250x16-5-mm"],
  );
  assert.equal(applyListingFilters(list, {}).length, 3);

  const href = listingHref("/plafondpanelen", {}, { ceilingPlace: "buiten" });
  assert.equal(href, "/plafondpanelen?plek=buiten");
  const path = listingRewriteTarget("/plafondpanelen", new URLSearchParams("plek=buiten"));
  assert.equal(path, "/weergave/categorie/plafondpanelen/p/1/plek/buiten");
  assert.equal(parseListingSearchParams({ plek: "buiten" }).ceilingPlace, "buiten");
  assert.equal(parseListingSearchParams({ plek: "ergens" }).ceilingPlace, undefined);
});

test("Toepassing counts stay visible and other facets follow the chosen place", () => {
  const binnenPaneel = ceilingProduct("florence-binnenplafond-paneel-250x10mm", "Florence binnenplafond paneel", {
    productGroup: "gevelpaneel",
  });
  const binnenProfiel = ceilingProduct("florence-omrandingprofiel-10mm-2-delig", "Florence omrandingprofiel 10mm", {
    productGroup: "afwerkprofiel",
  });
  const buiten = ceilingProduct("florence-buitenplafond-paneel-250x16-5-mm", "Florence buitenplafond paneel", {
    productGroup: "gevelpaneel",
  });
  const view = prepareListing([binnenPaneel, binnenProfiel, buiten], { ceilingPlace: "binnen" }, 1, 10);
  assert.deepEqual(view.facets.places, [
    { slug: "binnen", count: 2 },
    { slug: "buiten", count: 1 },
  ]);
  assert.deepEqual(
    view.facets.groups.map((item) => item.slug),
    ["gevelpaneel", "afwerkprofiel"],
  );
  assert.equal(view.facets.groups.find((item) => item.slug === "gevelpaneel")?.count, 1);
  assert.equal(view.facets.groups.find((item) => item.slug === "afwerkprofiel")?.count, 1);
  assert.equal(listingFacets([buiten]).places[0]?.slug, "buiten");
});
