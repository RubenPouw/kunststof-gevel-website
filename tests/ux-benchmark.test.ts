import assert from "node:assert/strict";
import test from "node:test";

import { resolveColour, UNKNOWN_COLOUR_HEX } from "../src/lib/catalog/colours.ts";
import { enrichProduct } from "../src/lib/catalog/derive.ts";
import { profileRole } from "../src/lib/catalog/helpers.ts";
import { matchProductLine } from "../src/lib/catalog/text-rules.ts";
import { inferBrand } from "../src/lib/shopify/map.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { SHIPPING_FLAT, FREE_SHIPPING_FROM, shippingEstimateCopy } from "../src/lib/format.ts";
import { addBasketItem } from "../src/lib/kozijnen/basket.ts";
import { confirmedLeadTimeWeeks, leadTimeLabel, leadTimeWeeksByCategory } from "../src/lib/lead-time.ts";
import { paymentMethodsEnabled } from "../src/lib/payments.ts";

function variant(colorName: string, sku = colorName): ProductVariant {
  return {
    sku,
    ean: "",
    colorName,
    hex: "#7A4E2E",
    length: "6 m",
    price: 80,
    inStock: true,
    colorFamily: "overig",
    sampleId: `test:${colorName}`,
  };
}

function product(partial: Partial<Product> & Pick<Product, "slug" | "name" | "category">): Product {
  return {
    vendor: "Test",
    brand: "Test",
    brandSlug: "test",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [variant("Antraciet")],
    price: 80,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "6 m",
    images: [],
    profileType: "sponning",
    sampleable: false,
    source: "shopify",
    ...partial,
  };
}

test("A24 is antraciet and not a brown chip, HPL decor codes stay codes", () => {
  const a24 = resolveColour("A24", "", { codes: true });
  assert.equal(a24.name, "Antraciet");
  assert.equal(a24.hex, "#3A3D41");
  assert.equal(a24.family, "donker");
  assert.notEqual(a24.hex.toLowerCase(), "#7a4e2e");

  const named = resolveColour("Grafietzwart classic nerf");
  assert.equal(named.family, "donker");
  assert.equal(named.hex, "#3A3D41");

  const sheet = enrichProduct(
    product({
      slug: "hpl-f39",
      name: "HPL plaat F39",
      category: "hpl-platen",
      variants: [variant("F39", "mpf04101")],
    }),
  );
  assert.equal(sheet.variants[0]?.colorName, "F39");

  const panel = enrichProduct(
    product({
      slug: "vinyplus-rabat",
      name: "VinyPlus rabat",
      category: "gevelbekleding",
      variants: [variant("B42", "04014260"), variant("A24", "03200460")],
    }),
  );
  assert.equal(panel.variants.find((item) => item.sku === "04014260")?.colorName, "Creme");
  assert.equal(panel.variants.find((item) => item.sku === "04014260")?.colorFamily, "licht");
  assert.equal(panel.variants.find((item) => item.sku === "03200460")?.colorName, "Antraciet");
  assert.equal(panel.colors.some((color) => color.family === "overig"), false);

  assert.equal(resolveColour("Verkeerswit").family, "licht");
  assert.equal(resolveColour("Verkeerswit").hex, "#F4F1EA");
  const unknown = resolveColour("ZX9", "", { codes: true });
  assert.equal(unknown.name, "ZX9");
  assert.equal(unknown.hex, UNKNOWN_COLOUR_HEX);

  for (const name of ["Groen", "Blauw", "Rood", "Wijnrood", "Bruin", "Donkerbruin", "Geel", "Rvs", "Alpin", "Elba", "Helios", "Tirol", "Monumentengroen", "Mosgroen", "Lichtblauw"]) {
    assert.notEqual(resolveColour(name).family, "overig", name);
  }
  assert.equal(resolveColour("Groen").family, "groen");
  assert.equal(resolveColour("Wijnrood").family, "rood");
  assert.equal(resolveColour("Alpin").family, "steen");
  assert.equal(resolveColour("Transparant").family, "overig");
  assert.equal(resolveColour("Transparant").hex, UNKNOWN_COLOUR_HEX);
});

test("Novicell stays its own brand when the supplier is Heering", () => {
  assert.equal(matchProductLine("Novicell sponningdeel 167mm grove nerf"), "novicell");
  assert.equal(matchProductLine("Keralit sponningdeel 143mm"), "keralit");
  const brand = inferBrand({
    vendor: "Heering",
    title: "Novicell sponningdeel 167mm grove nerf",
    tags: [],
    handle: "novicell-sponningdeel-167mm-grove-nerf",
    productType: "gevelbekleding",
  });
  assert.equal(brand.slug, "novicell");
  assert.equal(brand.name, "Novicell");
});

test("lead time stays empty until a week count is confirmed", () => {
  for (const weeks of Object.values(leadTimeWeeksByCategory)) assert.equal(weeks, null);
  assert.equal(confirmedLeadTimeWeeks("kozijnen", "draaikiepraam"), null);
  assert.equal(confirmedLeadTimeWeeks("gevelbekleding"), null);
  assert.equal(leadTimeLabel(null, "Op voorraad"), "Op voorraad");
  assert.equal(leadTimeLabel(null, "Levertijd 5 werkdagen"), "Levertijd 5 werkdagen");
  assert.equal(leadTimeLabel(1, "Op voorraad"), "Levertijd 1 week");
  assert.equal(leadTimeLabel(3, "Op voorraad"), "Levertijd 3 weken");
});

test("gevel profiles split into noodzakelijk and aanbevolen", () => {
  const schroef = product({ slug: "schroef", name: "Keralit schroef 30 mm rvs", category: "montage", profileType: "profiel" });
  const start = product({ slug: "start", name: "Keralit startprofiel horizontaal", category: "montage", profileType: "profiel" });
  const eind = product({ slug: "eind", name: "VinyPlus montage eindprofiel 3 m", category: "montage", profileType: "profiel" });
  const verbind = product({ slug: "verbind", name: "Keralit verbindstuk voor 143 mm", category: "montage", profileType: "profiel" });
  const paneel = product({ slug: "paneel", name: "Keralit sponning 143", category: "gevelbekleding" });
  assert.equal(profileRole(schroef), "noodzakelijk");
  assert.equal(profileRole(start), "noodzakelijk");
  assert.equal(profileRole(eind), "aanbevolen");
  assert.equal(profileRole(verbind), "aanbevolen");
  assert.equal(profileRole(paneel), null);
});

test("Klarna and Riverty stay off unless the flag is exactly true", () => {
  assert.deepEqual(paymentMethodsEnabled({}), { klarna: false, riverty: false });
  assert.deepEqual(paymentMethodsEnabled({ BETALEN_KLARNA_ACTIEF: "false", BETALEN_RIVERTY_ACTIEF: "1" }), {
    klarna: false,
    riverty: false,
  });
  assert.deepEqual(paymentMethodsEnabled({ BETALEN_KLARNA_ACTIEF: "true", BETALEN_RIVERTY_ACTIEF: "true" }), {
    klarna: true,
    riverty: true,
  });
});

test("shipping copy uses the existing amounts", () => {
  assert.equal(SHIPPING_FLAT, 49);
  assert.equal(FREE_SHIPPING_FROM, 499);
  assert.match(shippingEstimateCopy(), /€\s*49,00/);
  assert.match(shippingEstimateCopy(), /€\s*499,00/);
  assert.match(shippingEstimateCopy(), /excl\. btw/);
  assert.equal(shippingEstimateCopy().includes("—"), false);
});

test("offertemand dedupes the same configuration and keeps twelve", () => {
  const item = { layout: "draaikiepraam", query: "b=1000&h=1200", title: "Draaikiepraam" };
  const once = addBasketItem([], item);
  const twice = addBasketItem(once, { ...item, title: "Draaikiepraam 1000" });
  assert.equal(twice.length, 1);
  assert.equal(twice[0]?.title, "Draaikiepraam 1000");
  let items = once;
  for (let index = 0; index < 20; index += 1) {
    items = addBasketItem(items, { layout: "vast-raam", query: `b=${index}`, title: `Vast ${index}` });
  }
  assert.equal(items.length, 12);
});
