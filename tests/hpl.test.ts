import assert from "node:assert/strict";
import test from "node:test";

import { HPL_SHEET_M2, sheetOrder } from "../src/lib/area.ts";
import { applyListingFilters } from "../src/lib/catalog/helpers.ts";
import { enrichProduct } from "../src/lib/catalog/derive.ts";
import {
  extractHplColor,
  isHplSheetText,
  matchHplLine,
  withoutTrespa,
} from "../src/lib/catalog/text-rules.ts";
import type { Product } from "../src/lib/catalog/types.ts";
import { fallbackTarget } from "../src/lib/seo/redirects.ts";
import {
  categoryFromCollectionHandle,
  categoryFromProductType,
  categoryFromTitle,
  inferBrand,
} from "../src/lib/shopify/map.ts";

test("one sheet is 3.965 m2 and the next millimetre needs a second sheet", () => {
  assert.equal(HPL_SHEET_M2, 3.965);
  const exact = sheetOrder({ widthM: 3.05, heightM: 1.3 });
  assert.equal(exact.ok, true);
  if (!exact.ok) return;
  assert.equal(exact.sheets, 1);

  const over = sheetOrder({ widthM: 3.965, heightM: 1.001 });
  assert.equal(over.ok, true);
  if (!over.ok) return;
  assert.equal(over.sheets, 2);
});

test("openings are subtracted and the order stays in whole sheets", () => {
  const order = sheetOrder({ widthM: 10, heightM: 2, openingsM2: 4 });
  assert.equal(order.ok, true);
  if (!order.ok) return;
  assert.equal(order.netM2, 16);
  assert.equal(order.sheets, 5);
});

test("HPL lines and colours come from the title, without the unsold laminate name", () => {
  assert.equal(matchHplLine("HPL Compact Exterieur antraciet"), "hpl-compact-exterieur");
  assert.equal(matchHplLine("Renolit eenzijdig wit"), "renolit");
  assert.equal(matchHplLine("Abet rosso"), "abet");
  assert.equal(matchHplLine("FR brandvertragend"), "hpl-fr");
  assert.equal(withoutTrespa("Trespa plaat voor buiten."), "HPL plaat voor buiten.");
  assert.equal(isHplSheetText("HPL plaat 3050 x 1300 x 6 mm"), true);
  assert.equal(isHplSheetText("sandwichpaneel hpl 24 mm"), false);
  assert.equal(isHplSheetText("HPL reiniger"), false);
  const color = extractHplColor("HPL Compact Exterieur Antraciet RAL 7016 3050x1300x6 mm");
  assert.equal(color.colorName, "Antraciet");
  assert.equal(color.ral, "RAL 7016");
  assert.equal(
    extractHplColor("HPL Compact Exterieur Wijnrood RAL 3005 3050 x 1300 x 6 mm Default Title").colorName,
    "Wijnrood",
  );
});

test("product type and collection land on the HPL category", () => {
  assert.equal(categoryFromProductType("HPL plaat"), "hpl-platen");
  assert.equal(categoryFromCollectionHandle("hpl-platen"), "hpl-platen");
  assert.equal(categoryFromTitle("HPL plaat wit"), "hpl-platen");
  assert.equal(categoryFromTitle("Sandwichpaneel HPL 24 mm"), undefined);
  const brand = inferBrand({
    vendor: "AJ Fust",
    title: "HPL Compact Exterieur Antraciet RAL 7016",
    tags: [],
    handle: "hpl-compact-exterieur-antraciet",
    productType: "HPL plaat",
  });
  assert.equal(brand.slug, "hpl-compact-exterieur");
});

test("a sheet does not get the gevel panel calculator", () => {
  const product = enrichProduct({
    slug: "hpl-compact-exterieur-antraciet",
    name: "HPL Compact Exterieur Antraciet",
    vendor: "HPL",
    brand: "HPL Compact Exterieur",
    brandSlug: "hpl-compact-exterieur",
    category: "hpl-platen",
    description: "Plaat.",
    specs: [{ label: "Dikte", value: "6 mm" }],
    relatedSlugs: [],
    variants: [
      {
        sku: "HPL-7016",
        ean: "",
        colorName: "Standaard",
        hex: "#3A3D41",
        length: "6 mm",
        price: 121,
        inStock: true,
        colorFamily: "overig",
        sampleId: "pending",
        options: [{ name: "Kleur", value: "Antraciet RAL 7016" }],
      },
    ],
    price: 121,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "6 mm",
    images: [],
    profileType: "overig",
    sampleable: false,
    workingWidthMm: 6,
  } satisfies Product);

  assert.equal(product.saleUnit, "sheet");
  assert.equal(product.sheetM2, 3.965);
  assert.equal(product.panelsPerM2, undefined);
  assert.equal(product.variants[0]?.panelsPerM2, undefined);
  assert.equal(product.length, "3050 × 1300 mm");
  assert.equal(product.variants[0]?.colorName, "Antraciet");
  assert.equal(product.variants[0]?.ral, "RAL 7016");
  assert.equal(product.sampleable, true);

  const filtered = applyListingFilters([product], { ral: "7016", colorSlug: "antraciet" });
  assert.equal(filtered.length, 1);
  assert.equal(applyListingFilters([product], { ral: "9010" }).length, 0);
});

test("old HPL urls fall forward to the sheet category", () => {
  assert.equal(fallbackTarget("/product/hpl-compact-exterieur-ral-7016"), "/hpl-platen");
  assert.equal(fallbackTarget("/product/hpl-reiniger-1000-ml"), "/gevelbekleding");
});
