import assert from "node:assert/strict";
import test from "node:test";

import volumeList from "../src/data/catalog/volume-discount-products.json" with { type: "json" };
import { staticProducts } from "../src/lib/catalog/static.ts";
import {
  isVolumeDiscountEligible,
  qualifyingInclFromLines,
  quoteVolumeDiscount,
  type VolumeDiscountProduct,
} from "../src/lib/catalog/volume-discount.ts";

function bySlug(slug: string) {
  const product = staticProducts.find((item) => item.slug === slug);
  assert.ok(product, slug);
  return product;
}

test("2,5% starts at 2000 incl. and ignores the rest of the cart", () => {
  const above = quoteVolumeDiscount(2400);
  assert.equal(above.applied, true);
  assert.equal(above.discountIncl, 60);
  const below = quoteVolumeDiscount(1900);
  assert.equal(below.applied, false);
  assert.equal(below.discountIncl, 0);
  assert.equal(below.remainingIncl, 100);
  const mixed = qualifyingInclFromLines([
    { unitExcl: 1983.47, qty: 1, eligible: true },
    { unitExcl: 247.93, qty: 1, eligible: false },
  ]);
  assert.equal(mixed, 2400);
  assert.equal(quoteVolumeDiscount(mixed).discountIncl, 60);
});

test("gevelpanelen tellen mee, ook als het Shopify-type Heering overig is", () => {
  for (const slug of [
    "vinyplus-rondkantpaneel-150",
    "vinyplus-quattro-299",
    "keralit-sponning-143",
    "keralit-potdeksel-177",
    "eurotexx-potdeksel-180",
    "kerrafront-multi-sponningdeel-332",
    "kerrafront-dubbel-sponningdeel-332",
  ]) {
    assert.equal(isVolumeDiscountEligible(bySlug(slug)), true, slug);
  }
  const potdeksel = bySlug("keralit-potdeksel-177");
  assert.equal(
    isVolumeDiscountEligible({ ...potdeksel, productType: "Heering overig" }),
    true,
  );
});

test("de genoemde dakrandpanelen tellen mee en de profielen niet", () => {
  for (const slug of [
    "vinyplus-dakrandpaneel-200",
    "vinyplus-dakrandpaneel-295",
    "keralit-dakrand-paneel-200",
    "keralit-dakrand-paneel-250",
    "keralit-dakrand-paneel-300",
    "milexx-volschuim-dakrand-hoek-35",
  ]) {
    assert.equal(isVolumeDiscountEligible(bySlug(slug)), true, slug);
  }
  assert.equal(
    isVolumeDiscountEligible({
      name: "Keralit dakrandpaneel 350 mm",
      slug: "keralit-dakrandpaneel-350mm",
      productType: "Dakrand",
    }),
    true,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Milexx Volschuim big board 395x16 mm",
      slug: "milexx-volschuim-big-board-395x16-mm",
      productType: "Dakrand",
    }),
    true,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Unipanel bouwpaneel 610x16mm",
      slug: "unipanel-bouwpaneel-610x16mm",
      productType: "Gevelbekleding",
    }),
    true,
  );
  for (const slug of [
    "keralit-dakrand-eindprofiel-10mm",
    "keralit-dakrand-montage-profiel-10mm",
    "keralit-h-verbindingprofiel-10mm",
  ]) {
    assert.equal(isVolumeDiscountEligible(bySlug(slug)), false, slug);
  }
  const lijm: VolumeDiscountProduct = {
    name: "Keralit montagelijm",
    slug: "keralit-montagelijm",
    category: "dakranden",
    productType: "Dakrand",
  };
  assert.equal(isVolumeDiscountEligible(lijm), false);
  assert.equal(
    isVolumeDiscountEligible({
      name: "Volschuim paneel haakse hoek 200x35 mm",
      slug: "volschuim-paneel-haakse-hoek-200x35-mm",
      productType: "Dakrand",
    }),
    false,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Unipanel sierlijst 36x52mm",
      slug: "unipanel-sierlijst-36x52mm",
      productType: "Dakranden",
    }),
    false,
  );
});

test("plafond, HPL en Zierer-steenstrips wel, hulpstukken en Wonderboard niet", () => {
  assert.equal(
    isVolumeDiscountEligible({
      name: "Florence plafond paneel wit",
      slug: "florence-plafond-paneel",
      category: "plafondpanelen",
    }),
    true,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Florence plafond profiel",
      slug: "florence-plafond-profiel",
      category: "plafondpanelen",
      productType: "Plafondpanelen",
    }),
    false,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
      slug: "milyt-hpl-plaat-3050-x-1300-x-6-mm",
      category: "hpl-platen",
      saleUnit: "sheet",
    }),
    true,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Zierer steenstrip 1096 x 359 mm wildverband",
      slug: "zierer-steenstrip-1096-x-359-mm-wildverband",
      productType: "Gevelbekleding",
    }),
    true,
  );
  for (const slug of [
    "zierer-hoekstuk-50x50x345",
    "milinboard-overzetvensterbank-380",
    "milinboard-eindkap-400",
    "vinyplus-schroeven-35x30",
    "keralit-basis-uitwendig-hoekprofiel",
    "keralit-eindkap-hoek-uitwendig",
    "keralit-reiniger",
    "eurotexx-ventilatie-65x17",
    "afdichtingsprofiel-pvc-45",
  ]) {
    assert.equal(isVolumeDiscountEligible(bySlug(slug)), false, slug);
  }
  assert.equal(
    isVolumeDiscountEligible({
      name: "Wonderboard 2500x1200x2,3 mm structuur",
      slug: "wonderboard-2500x1200x2-3-mm-structuur",
      productType: "Hygiënische wandbekleding",
    }),
    false,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Kunststof kozijn draaikiepraam",
      slug: "kunststof-kozijn-draaikiepraam",
    }),
    false,
  );
  assert.equal(isVolumeDiscountEligible(bySlug("profex-duafort-rabat-125")), false);
  assert.equal(
    isVolumeDiscountEligible({
      name: "Rabat 125 mm",
      slug: "rabat-125",
      brand: "Profex",
      brandSlug: "profex",
    }),
    false,
  );
  assert.equal(
    isVolumeDiscountEligible({
      name: "Canexel rabat",
      slug: "canexel-rabat",
    }),
    false,
  );
});

test("the Shopify list matches every qualifying product in this catalog", () => {
  const expected = staticProducts
    .filter((product) => isVolumeDiscountEligible(product))
    .map((product) => product.slug)
    .sort();
  const listed = volumeList.map((row) => row.handle).sort();
  assert.deepEqual(listed, expected);
  assert.equal(listed.length, 15);
  assert.equal(listed.includes("profex-duafort-rabat-125"), false);
  for (const row of volumeList) {
    const product = bySlug(row.handle);
    assert.equal(row.title, product.name);
  }
});
