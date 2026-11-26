import assert from "node:assert/strict";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import {
  VINYPLUS_PROFILE_COPY,
  lengthCaption,
  pickVinyplusProfiles,
  vinyplusLengthOffer,
} from "../src/lib/catalog/vinyplus-profiles.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";

const BANNED = ["Eko", "Duafort", "Canexel", "Linerio", "Wonderboard"];

function variant(length: string, price: number, colorName = "Antraciet"): ProductVariant {
  return {
    sku: `${colorName}-${length}`,
    ean: "",
    colorName,
    hex: "#333333",
    length,
    price,
    inStock: true,
    colorFamily: "donker",
    sampleId: colorName,
  };
}

function profile(slug: string, name: string, variants: ProductVariant[], price = variants[0]?.price ?? 0): Product {
  return {
    slug,
    name,
    vendor: "VinyPlus",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants,
    price,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: variants[0]?.length ?? "",
    images: [],
    profileType: "overig",
    sampleable: true,
    workingWidthMm: /299/.test(name) ? 299 : 150,
  };
}

test("picks Quattro, Vario, Rondkant and Rabat in that order", () => {
  const products = [
    profile("vinyplus-dakrandpaneel-295x16-mm", "VinyPlus dakrandpaneel 295x16 mm", [variant("stuk", 44)]),
    profile("vinyplus-rabatdeel-150-mm", "VinyPlus rabatdeel 150 mm", [variant("6 m", 13.57)]),
    profile("vinyplus-rondkantpaneel-150-mm", "VinyPlus rondkantpaneel 150 mm", [variant("6 m", 13.57)]),
    profile("vinyplus-vario-299mm", "VinyPlus Vario 299mm", [variant("6 m", 27.04)]),
    profile("vinyplus-quattro-299mm", "VinyPlus Quattro 299mm", [variant("6 m", 27.04)]),
    profile("vinyplus-rabat-stootvoegverbinding", "VinyPlus rabat stootvoegverbinding", [variant("stuk", 9.7)]),
  ];
  const picked = pickVinyplusProfiles(products);
  assert.deepEqual(
    picked.map((product) => product.slug),
    [
      "vinyplus-quattro-299mm",
      "vinyplus-vario-299mm",
      "vinyplus-rondkantpaneel-150-mm",
      "vinyplus-rabatdeel-150-mm",
    ],
  );
});

test("static catalog handles still resolve to Quattro and Rondkant", () => {
  const picked = pickVinyplusProfiles(staticProducts);
  assert.deepEqual(
    picked.map((product) => product.slug),
    ["vinyplus-quattro-299", "vinyplus-rondkantpaneel-150"],
  );
  const quattro = picked[0];
  assert.ok(quattro);
  const offer = vinyplusLengthOffer(quattro);
  const sixMetre = quattro.variants.filter((variant) => variant.length === "6 m").map((variant) => variant.price);
  assert.equal(offer?.incl, Math.min(...sixMetre));
  assert.equal(offer?.length, "6 m");
  assert.ok(offer && offer.incl > Math.min(...quattro.variants.map((variant) => variant.price)));
});

test("length price is the stored price of the full length, not a per-metre rate", () => {
  const stored = 27.04;
  const product = profile("vinyplus-quattro-299mm", "VinyPlus Quattro 299mm", [
    variant("3 m", 16.2),
    variant("6 m", stored + 4, "Wit"),
    variant("6 m", stored),
  ]);
  const offer = vinyplusLengthOffer(product);
  assert.equal(offer?.incl, stored);
  assert.equal(offer?.length, "6 m");
  assert.notEqual(offer?.incl, stored / 6);
  assert.equal(lengthCaption(offer?.length, "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption(offer?.length, "excl"), "Per lengte van 600 cm, excl. btw");
});

test("600 cm and 6000 mm are the same length caption", () => {
  assert.equal(lengthCaption("600 cm", "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption("6000 mm", "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption("stuk", "incl"), "Prijs is de hele productlengte, incl. btw");
});

test("a panel without a price does not invent one", () => {
  const product = profile("vinyplus-vario-299mm", "VinyPlus Vario 299mm", [variant("6 m", 0)], 0);
  assert.equal(vinyplusLengthOffer(product), null);
});

test("profile copy names the four panels and skips banned words", () => {
  const text = Object.values(VINYPLUS_PROFILE_COPY).join(" ");
  assert.match(text, /Quattro/);
  assert.match(text, /Vario/);
  assert.match(text, /Rondkant/);
  assert.match(text, /Rabat/);
  assert.equal(text.includes("—"), false);
  assert.equal(text.includes("–"), false);
  for (const word of BANNED) assert.equal(text.includes(word), false, word);
});
