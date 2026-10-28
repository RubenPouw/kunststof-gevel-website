import assert from "node:assert/strict";
import test from "node:test";

import { enrichProduct } from "../src/lib/catalog/derive.ts";
import { resolveColour } from "../src/lib/catalog/colours.ts";
import {
  canonHplColorToken,
  filterHplCards,
  hplColorTokenLabel,
  hplColorCards,
  hplHubHref,
  hplRelatedProducts,
  parseHplHubSearch,
  tidyHplColorName,
} from "../src/lib/catalog/hpl-hub.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { isShopNavActive } from "../src/lib/site.ts";

function variant(colorName: string, price = 211.86, sku = colorName): ProductVariant {
  return {
    sku,
    ean: "",
    colorName,
    hex: "#cccccc",
    length: "6 mm",
    price,
    inStock: true,
    colorFamily: "overig",
    sampleId: "pending",
  };
}

function sheet(partial: {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  colors?: { name: string; price?: number; sku?: string }[];
  price?: number;
  category?: Product["category"];
}): Product {
  const colors = partial.colors ?? [{ name: "Default Title", price: partial.price }];
  return enrichProduct({
    slug: partial.slug,
    name: partial.name,
    vendor: "HPL",
    brand: partial.brand,
    brandSlug: partial.brandSlug,
    category: partial.category ?? "hpl-platen",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: colors.map((color) => variant(color.name, color.price ?? partial.price ?? 211.86, color.sku ?? color.name)),
    price: partial.price ?? colors[0]?.price ?? 211.86,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "6 mm",
    images: [],
    profileType: "overig",
    sampleable: false,
    source: "shopify",
  });
}

const corten = sheet({
  slug: "hpl-compact-corten-4060",
  name: "HPL Compact Exterieur plaat 6 mm Cortenstaal look decor 4060 type C (3050 x 1300 mm)",
  brand: "HPL Compact Exterieur",
  brandSlug: "hpl-compact-exterieur",
  colors: [{ name: "Cortenstaal look decor type C mm Default Title", sku: "CORTEN-C" }],
});

const signaal = sheet({
  slug: "hpl-compact-signaalrood",
  name: "HPL Compact Exterieur plaat 6 mm Signaalrood RAL 3001 (3050 x 1300 mm)",
  brand: "HPL Compact Exterieur",
  brandSlug: "hpl-compact-exterieur",
  colors: [{ name: "Signaalrood mm Default Title", sku: "RAL-3001", price: 240.8 }],
});

const wijn = sheet({
  slug: "hpl-compact-wijnrood",
  name: "HPL Compact Exterieur plaat 6 mm Wijnrood RAL 3005 (3050 x 1300 mm)",
  brand: "HPL Compact Exterieur",
  brandSlug: "hpl-compact-exterieur",
  colors: [{ name: "Wijnrood mm Default Title", sku: "RAL-3005" }],
});

const antraciet = sheet({
  slug: "hpl-renolit-antraciet",
  name: "HPL Renolit eenzijdig plaat 6 mm Antraciet RAL 7016 (3050 x 1300 mm)",
  brand: "Renolit eenzijdig",
  brandSlug: "renolit",
  colors: [{ name: "Antraciet mm Default Title", sku: "REN-7016", price: 338.13 }],
});

const fr = sheet({
  slug: "hpl-compact-fr-antraciet",
  name: "HPL Compact Exterieur FR plaat 6 mm brandvertragend Antraciet RAL 7016 (3050 x 1300 mm)",
  brand: "HPL Compact Exterieur",
  brandSlug: "hpl-compact-exterieur",
  colors: [{ name: "Antraciet mm Default Title", sku: "FR-7016", price: 271.13 }],
});

const milyt = sheet({
  slug: "milyt-hpl-plaat-6",
  name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
  brand: "HPL",
  brandSlug: "hpl",
  colors: [
    { name: "Wit (folie) (F39)", sku: "F39", price: 387.45 },
    { name: "Antraciet (folie) (A35)", sku: "A35", price: 387.45 },
  ],
});

const ghost = sheet({
  slug: "milyt-hpl-plaat-leeg",
  name: "Milyt HPL plaat 3050 x 1300 x 6 mm",
  brand: "HPL",
  brandSlug: "hpl",
  price: 0,
  colors: [{ name: "Milyt mm Default Title", price: 0, sku: "LEEG" }],
});

const sandwich = sheet({
  slug: "sandwichpaneel-hpl-hpl",
  name: "Sandwichpaneel HPL/HPL 3050 x 1150 x 24 mm",
  brand: "Milin",
  brandSlug: "milin",
  category: "kozijnafwerking",
  price: 364.22,
  colors: [{ name: "Wit (F10)", price: 364.22, sku: "SAND" }],
});

const reiniger = sheet({
  slug: "milyt-hpl-reiniger-1-liter",
  name: "Milyt HPL reiniger 1 liter",
  brand: "Milin",
  brandSlug: "milin",
  category: "montage",
  price: 12.16,
  colors: [{ name: "Transparant (E69)", price: 12.16, sku: "REIN" }],
});

const dun = sheet({
  slug: "milyt-hpl-plaat-2mm",
  name: "Milyt HPL plaat 3050x1150x2 mm",
  brand: "HPL",
  brandSlug: "hpl",
  category: "montage",
  price: 309.9,
  colors: [{ name: "Wit (folie) (F39)", price: 309.9, sku: "DUN" }],
});

const catalog = [corten, signaal, wijn, antraciet, fr, milyt, ghost, sandwich, reiniger, dun];

test("decor looks get a family from the colour name, corten stays out of overig", () => {
  assert.equal(resolveColour("Cortenstaal look decor type C").family, "metaal");
  assert.equal(resolveColour("Zinklook decor").family, "metaal");
  assert.equal(resolveColour("Betonlook decor").family, "steen");
  assert.equal(resolveColour("Kalksteen decor").family, "steen");
  assert.equal(resolveColour("Whitewash decor").family, "houtlook");
  assert.equal(resolveColour("Signaalrood").family, "rood");
  assert.equal(resolveColour("Pasteloranje").family, "overig");
});

test("sheet colour labels drop the Shopify default-title suffix", () => {
  assert.equal(tidyHplColorName("Cortenstaal look decor type C mm Default Title"), "Cortenstaal look decor type C");
  assert.equal(tidyHplColorName("Wijnrood mm Default Title"), "Wijnrood");
  assert.equal(tidyHplColorName("Wit (folie) (F39)"), "Wit (folie) (F39)");
});

test("the colour wall is exterior sheet colours, not sandwich, cleaner or the empty Milyt row", () => {
  const cards = hplColorCards(catalog);
  const names = cards.map((card) => `${card.line}:${card.colorName}`);
  assert.ok(names.includes("compact:Cortenstaal look decor type C"));
  assert.ok(names.includes("compact:Signaalrood"));
  assert.ok(names.includes("compact:Wijnrood"));
  assert.ok(names.includes("renolit:Antraciet"));
  assert.ok(names.includes("fr:Antraciet"));
  assert.ok(names.includes("milyt:Wit (folie) (F39)"));
  assert.equal(names.some((name) => name.startsWith("milyt:Milyt")), false);
  assert.equal(cards.some((card) => card.slug.includes("sandwich") || card.slug.includes("reiniger")), false);
  assert.equal(cards.some((card) => card.price <= 0), false);
  assert.equal(cards.find((card) => card.slug === "hpl-compact-corten-4060")?.afwerking, "decor");
  assert.equal(cards.find((card) => card.colorName === "Signaalrood")?.afwerking, "ral");
  assert.equal(cards.find((card) => card.colorName === "Signaalrood")?.ral, "RAL 3001");

  const related = hplRelatedProducts(catalog).map((product) => product.slug);
  assert.deepEqual(related, ["milyt-hpl-plaat-2mm", "milyt-hpl-reiniger-1-liter", "sandwichpaneel-hpl-hpl"]);
});

test("?color=cortensteel,red keeps corten and red sheets and drops antraciet", () => {
  const cards = hplColorCards(catalog);
  const query = parseHplHubSearch({ color: "cortensteel,red" });
  assert.deepEqual(query.colors, ["corten", "rood"]);
  const hits = filterHplCards(cards, query).map((card) => card.colorName);
  assert.deepEqual(hits.sort(), ["Cortenstaal look decor type C", "Signaalrood", "Wijnrood"]);
  assert.equal(canonHplColorToken("anthracite"), "antraciet");
  assert.equal(hplColorTokenLabel("corten"), "Cortenstaal");
  const antra = filterHplCards(cards, parseHplHubSearch({ color: "antraciet" }));
  assert.equal(antra.length, 3);
  assert.ok(antra.every((card) => card.colorName.startsWith("Antraciet")));
});

test("line and RAL or decor filters use the title, not a made-up attribute", () => {
  const cards = hplColorCards(catalog);
  const renolit = filterHplCards(cards, parseHplHubSearch({ lijn: "renolit-eenzijdig" }));
  assert.deepEqual(renolit.map((card) => card.line), ["renolit"]);
  const compact = filterHplCards(cards, parseHplHubSearch({ lijn: "compact" }));
  assert.ok(compact.every((card) => card.line === "compact"));
  assert.equal(compact.some((card) => card.line === "fr"), false);
  const decor = filterHplCards(cards, parseHplHubSearch({ afwerking: "decor" }));
  assert.deepEqual(decor.map((card) => card.colorName), ["Cortenstaal look decor type C"]);
  const ral = filterHplCards(cards, parseHplHubSearch({ afwerking: "ral" }));
  assert.equal(ral.some((card) => card.afwerking !== "ral"), false);
  assert.ok(ral.some((card) => card.colorName === "Wijnrood"));
});

test("hub links keep the competitor colour query and the nav points at the hub", () => {
  const href = hplHubHref("/hpl-plaat", parseHplHubSearch({ color: "cortensteel,red", lijn: "compact" }));
  assert.equal(href, "/hpl-plaat?lijn=compact&color=corten,rood");
  assert.equal(isShopNavActive("/hpl-plaat", "/hpl-plaat"), true);
  assert.equal(isShopNavActive("/hpl-plaat/kleur-structuur", "/hpl-plaat"), true);
  assert.equal(isShopNavActive("/hpl-platen", "/hpl-plaat"), true);
  assert.equal(isShopNavActive("/dakranden", "/hpl-plaat"), false);
});
