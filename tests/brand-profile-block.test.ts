import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BRAND_PROFILE_COPY,
  PROFILE_CARD_LIMIT,
  isProfileCardProduct,
  lengthCaption,
  lengthOffer,
  pickBrandProfiles,
} from "../src/lib/catalog/brand-profiles.ts";
import { staticBrands, staticProducts } from "../src/lib/catalog/static.ts";
import type { Product, ProductGroup, ProductVariant, ProfileType } from "../src/lib/catalog/types.ts";

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

function panel(options: {
  slug: string;
  name: string;
  brand?: string;
  brandSlug?: string;
  category?: Product["category"];
  productGroup?: ProductGroup;
  profileType?: ProfileType;
  saleUnit?: Product["saleUnit"];
  variants?: ProductVariant[];
  price?: number;
  workingWidthMm?: number;
  badge?: Product["badge"];
}): Product {
  const variants = options.variants ?? [variant("6 m", options.price ?? 10)];
  return {
    slug: options.slug,
    name: options.name,
    vendor: options.brand ?? "VinyPlus",
    brand: options.brand ?? "VinyPlus",
    brandSlug: options.brandSlug ?? "vinyplus",
    category: options.category ?? "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    badge: options.badge,
    variants,
    price: options.price ?? variants[0]?.price ?? 0,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: variants[0]?.length ?? "",
    images: [],
    productGroup: options.productGroup ?? "gevelpaneel",
    profileType: options.profileType ?? "overig",
    sampleable: true,
    saleUnit: options.saleUnit,
    workingWidthMm: options.workingWidthMm,
  };
}

test("picks Quattro, Vario, Rondkant and Rabat and skips dakrand and profiles", () => {
  const products = [
    panel({
      slug: "vinyplus-dakrandpaneel-295x16-mm",
      name: "VinyPlus dakrandpaneel 295x16 mm",
      category: "dakranden",
      profileType: "dakrand",
      variants: [variant("stuk", 44)],
    }),
    panel({
      slug: "vinyplus-rabatdeel-150-mm",
      name: "VinyPlus rabatdeel 150 mm",
      profileType: "rabat",
      workingWidthMm: 150,
      variants: [variant("6 m", 13.57)],
    }),
    panel({
      slug: "vinyplus-rondkantpaneel-150-mm",
      name: "VinyPlus rondkantpaneel 150 mm",
      profileType: "rondkant",
      workingWidthMm: 150,
      variants: [variant("6 m", 13.57)],
    }),
    panel({
      slug: "vinyplus-vario-299mm",
      name: "VinyPlus Vario 299mm",
      workingWidthMm: 299,
      variants: [variant("6 m", 27.04)],
    }),
    panel({
      slug: "vinyplus-quattro-299mm",
      name: "VinyPlus Quattro 299mm",
      profileType: "quattro",
      workingWidthMm: 299,
      variants: [variant("6 m", 27.04)],
    }),
    panel({
      slug: "vinyplus-rabat-stootvoegverbinding",
      name: "VinyPlus rabat stootvoegverbinding",
      productGroup: "afwerkprofiel",
      profileType: "profiel",
      variants: [variant("stuk", 9.7)],
    }),
  ];
  const picked = pickBrandProfiles(products, { slug: "vinyplus", name: "VinyPlus" });
  assert.deepEqual(
    picked.products.map((product) => product.slug),
    [
      "vinyplus-quattro-299mm",
      "vinyplus-vario-299mm",
      "vinyplus-rondkantpaneel-150-mm",
      "vinyplus-rabatdeel-150-mm",
    ],
  );
  assert.equal(picked.hasMore, false);
  assert.equal(picked.sheets, false);
});

test("static catalog handles still resolve to Quattro and Rondkant", () => {
  const picked = pickBrandProfiles(staticProducts, { slug: "vinyplus", name: "VinyPlus" });
  assert.deepEqual(
    picked.products.map((product) => product.slug),
    ["vinyplus-quattro-299", "vinyplus-rondkantpaneel-150"],
  );
  const quattro = picked.products[0];
  assert.ok(quattro);
  const offer = lengthOffer(quattro);
  const sixMetre = quattro.variants.filter((item) => item.length === "6 m").map((item) => item.price);
  assert.equal(offer?.incl, Math.min(...sixMetre));
  assert.equal(offer?.length, "6 m");
  assert.ok(offer && offer.incl > Math.min(...quattro.variants.map((item) => item.price)));
});

test("length price is the stored price of the full length, not a per-metre rate", () => {
  const stored = 27.04;
  const product = panel({
    slug: "vinyplus-quattro-299mm",
    name: "VinyPlus Quattro 299mm",
    profileType: "quattro",
    variants: [variant("3 m", 16.2), variant("6 m", stored + 4, "Wit"), variant("6 m", stored)],
  });
  const offer = lengthOffer(product);
  assert.equal(offer?.incl, stored);
  assert.equal(offer?.length, "6 m");
  assert.notEqual(offer?.incl, stored / 6);
  assert.equal(lengthCaption(offer?.length, "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption(offer?.length, "excl"), "Per lengte van 600 cm, excl. btw");
  assert.equal(lengthCaption("5 m", "incl"), "Per lengte van 500 cm, incl. btw");
});

test("captions use the real length, including millimetres and a whole sheet", () => {
  assert.equal(lengthCaption("600 cm", "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption("6000 mm", "incl"), "Per lengte van 600 cm, incl. btw");
  assert.equal(lengthCaption("1096 mm", "incl"), "Per lengte van 109,6 cm, incl. btw");
  assert.equal(lengthCaption("3050 × 1300 mm", "incl"), "Per plaat van 3050 × 1300 mm, incl. btw");
  assert.equal(lengthCaption("stuk", "incl"), "Prijs is de hele productlengte, incl. btw");
});

test("a panel without a price does not invent one", () => {
  const product = panel({
    slug: "vinyplus-vario-299mm",
    name: "VinyPlus Vario 299mm",
    variants: [variant("6 m", 0)],
    price: 0,
  });
  assert.equal(lengthOffer(product), null);
});

test("profile copy skips banned words and dash characters", () => {
  const text = Object.values(BRAND_PROFILE_COPY).join(" ");
  assert.match(text, /Kies je profiel/);
  assert.match(text, /Bekijk product/);
  assert.match(text, /Bekijk alle panelen/);
  assert.match(text, /incl\. btw/);
  assert.equal(text.includes("—"), false);
  assert.equal(text.includes("–"), false);
  assert.equal(/per\s*m(eter|ètre)?|\/\s*m\b|per m²/i.test(text), false);
  for (const word of BANNED) assert.equal(text.includes(word), false, word);
});

test("the block component does not hardcode a price", () => {
  const source = readFileSync(new URL("../src/components/catalog/brand-profile-block.tsx", import.meta.url), "utf8");
  const logic = readFileSync(new URL("../src/lib/catalog/brand-profiles.ts", import.meta.url), "utf8");
  for (const file of [source, logic]) {
    assert.equal(file.includes("—"), false);
    assert.equal(file.includes("–"), false);
    assert.equal(/€\s*\d/.test(file), false);
  }
  assert.match(source, /lengthOffer/);
  assert.match(source, /SampleAddButton/);
  assert.match(source, /\/staalaanvraag/);
  assert.match(source, /showLogo = true/);
});

test("Keralit shows the gevelpanelen and leaves the dakrand out", () => {
  const picked = pickBrandProfiles(staticProducts, { slug: "keralit", name: "Keralit" });
  assert.deepEqual(
    picked.products.map((product) => product.slug),
    ["keralit-sponning-143", "keralit-sponning-167", "keralit-sponning-190", "keralit-potdeksel-177"],
  );
  assert.equal(picked.hasMore, false);
});

test("Zierer strips count and a corner piece does not", () => {
  const products = [
    panel({
      slug: "zierer-steenstrip",
      name: "Zierer steenstrip 1096 x 359 mm wildverband",
      brand: "Zierer",
      brandSlug: "zierer",
      profileType: "steenstrip",
      workingWidthMm: 359,
      variants: [variant("1096 mm", 305.99)],
    }),
    panel({
      slug: "zierer-leisteen",
      name: "Zierer leisteenplaat 1096x359 mm",
      brand: "Zierer",
      brandSlug: "zierer",
      profileType: "steenstrip",
      workingWidthMm: 359,
      variants: [variant("1096 mm", 315.99)],
    }),
    panel({
      slug: "zierer-hoekstuk",
      name: "Zierer hoekstuk 359 mm grof",
      brand: "Zierer",
      brandSlug: "zierer",
      productGroup: "afwerkprofiel",
      profileType: "steenstrip",
      variants: [variant("stuk", 13.49)],
    }),
  ];
  const picked = pickBrandProfiles(products, { slug: "zierer", name: "Zierer" });
  assert.deepEqual(
    picked.products.map((product) => product.slug),
    ["zierer-leisteen", "zierer-steenstrip"],
  );
  const strip = picked.products.find((product) => product.slug === "zierer-steenstrip");
  assert.equal(lengthOffer(strip!)?.incl, 305.99);
  assert.equal(lengthCaption(lengthOffer(strip!)?.length, "incl"), "Per lengte van 109,6 cm, incl. btw");
});

test("brands without panels and blocked brands get no block", () => {
  assert.equal(pickBrandProfiles(staticProducts, { slug: "milinboard", name: "Milinboard" }).products.length, 0);
  assert.equal(pickBrandProfiles(staticProducts, { slug: "milexx", name: "Milexx" }).products.length, 0);
  assert.equal(pickBrandProfiles([], { slug: "profex", name: "Profex" }).products.length, 0);
  const banned = ["duafort", "canexel", "linerio", "wonderboard"].map((slug) =>
    panel({
      slug: `${slug}-rabat`,
      name: `${slug} rabat 150 mm`,
      brand: slug,
      brandSlug: slug,
      profileType: "rabat",
      workingWidthMm: 150,
    }),
  );
  for (const product of banned) {
    assert.equal(isProfileCardProduct(product), false, product.brandSlug);
    assert.equal(pickBrandProfiles([product], { slug: product.brandSlug, name: product.brand }).products.length, 0);
  }
  const named = panel({
    slug: "eko-rabat",
    name: "Eko rabat 150 mm",
    brand: "Overig",
    brandSlug: "overig",
    profileType: "rabat",
  });
  assert.equal(isProfileCardProduct(named), false);
});

test("Profex shows gevelpanelen from the catalog and skips the boeideel", () => {
  const picked = pickBrandProfiles(staticProducts, { slug: "profex", name: "Profex" });
  assert.deepEqual(
    picked.products.map((product) => product.slug),
    ["profex-dubbel-rabat-300", "profex-potdeksel-198", "profex-velling-165"],
  );
});

test("more than six panel models keep the main ones and flag the rest", () => {
  const products = Array.from({ length: 8 }, (_, index) =>
    panel({
      slug: `sponning-${index}`,
      name: `Sponning ${140 + index * 10} mm`,
      profileType: "sponning",
      workingWidthMm: 140 + index * 10,
      variants: [variant("6 m", 20 + index)],
    }),
  );
  const picked = pickBrandProfiles(products, { slug: "vinyplus", name: "VinyPlus" });
  assert.equal(picked.products.length, PROFILE_CARD_LIMIT);
  assert.equal(picked.total, 8);
  assert.equal(picked.hasMore, true);
  assert.deepEqual(
    picked.products.map((product) => product.workingWidthMm),
    [140, 150, 160, 170, 180, 190],
  );
});

test("HPL sheets are cards, duplicates collapse, and a 2 mm offcut stays out", () => {
  const sheets = [
    panel({
      slug: "hpl-plaat-zand",
      name: "HPL Compact Exterieur plaat 6 mm Zandkleur",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 211.86)],
    }),
    panel({
      slug: "hpl-plaat-antraciet-fr",
      name: "HPL Compact Exterieur FR plaat 6 mm brandvertragend Antraciet RAL 7016",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 271.13)],
    }),
    panel({
      slug: "hpl-plaat-antraciet",
      name: "HPL Compact Exterieur plaat 6 mm Antraciet RAL 7016",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 211.86)],
    }),
    panel({
      slug: "hpl-plaat-wit",
      name: "HPL Compact Exterieur plaat 6 mm Verkeerswit RAL 9016",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 152.68)],
    }),
    panel({
      slug: "hpl-plaat-zwart",
      name: "HPL Compact Exterieur plaat 6 mm Zwart RAL 9005",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 211.86)],
    }),
    panel({
      slug: "hpl-plaat-creme",
      name: "HPL Compact Exterieur plaat 6 mm Crème RAL 9001",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 152.68)],
    }),
    panel({
      slug: "hpl-plaat-beton",
      name: "HPL Compact Exterieur plaat 6 mm Betonlook",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 241.08)],
    }),
    panel({
      slug: "hpl-plaat-extra",
      name: "HPL Compact Exterieur plaat 6 mm Signaalrood RAL 3001",
      brand: "HPL Compact Exterieur",
      brandSlug: "hpl-compact-exterieur",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 240.8)],
    }),
    panel({
      slug: "milyt-leeg",
      name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
      brand: "HPL",
      brandSlug: "hpl",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 0)],
      price: 0,
    }),
    panel({
      slug: "milyt-hpl-plaat-3050-x-1300-x-6-mm-1",
      name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
      brand: "HPL",
      brandSlug: "hpl",
      category: "hpl-platen",
      productGroup: undefined,
      saleUnit: "sheet",
      variants: [variant("3050 × 1300 mm", 214.53)],
    }),
    panel({
      slug: "milyt-2mm",
      name: "Milyt HPL plaat 3050x1150x2 mm",
      brand: "HPL",
      brandSlug: "hpl",
      category: "montage",
      productGroup: "toebehoren",
      variants: [variant("3050 mm", 309.9)],
    }),
  ];
  const compact = pickBrandProfiles(sheets, { slug: "hpl-compact-exterieur", name: "HPL Compact Exterieur" });
  assert.equal(compact.sheets, true);
  assert.equal(compact.hasMore, true);
  assert.equal(compact.products.length, PROFILE_CARD_LIMIT);
  assert.equal(compact.products[0]?.slug, "hpl-plaat-antraciet");
  assert.equal(compact.products.some((product) => /brandvertragend|\bFR\b/.test(product.name)), false);
  assert.equal(lengthOffer(compact.products[0])?.incl, 211.86);
  assert.equal(lengthCaption(lengthOffer(compact.products[0])?.length, "incl"), "Per plaat van 3050 × 1300 mm, incl. btw");
  const milyt = pickBrandProfiles(sheets, { slug: "hpl", name: "HPL" });
  assert.deepEqual(
    milyt.products.map((product) => product.slug),
    ["milyt-hpl-plaat-3050-x-1300-x-6-mm-1"],
  );
  assert.equal(lengthOffer(milyt.products[0])?.incl, 214.53);
});

test("static catalog: only brands with gevelpanelen get a block", () => {
  const withBlock: string[] = [];
  const without: string[] = [];
  for (const brand of staticBrands) {
    const picked = pickBrandProfiles(staticProducts, brand);
    (picked.products.length ? withBlock : without).push(brand.slug);
  }
  assert.deepEqual(withBlock, ["keralit", "vinyplus", "eurotexx", "kerrafront", "profex"]);
  for (const slug of ["zierer", "milexx", "milinboard", "florence", "hpl", "unipanel"]) {
    assert.equal(without.includes(slug), true, slug);
  }
});
