import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { colourFilterMatches } from "../src/lib/catalog/colours.ts";
import { slugKey } from "../src/lib/catalog/derive.ts";
import { CATEGORY_PAGE_SIZE, prepareListing, toListingCard } from "../src/lib/catalog/listing.ts";
import { decodeListingState, listingRewriteTarget } from "../src/lib/catalog/paths.ts";
import { applyListingFilters, listingFacets, listingHref, mergeListingFilters, parseListingSearchParams } from "../src/lib/catalog/helpers.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { shopifyNumericId } from "../src/lib/shopify/ids.ts";
import { verifyShopifyWebhookHmac } from "../src/lib/shopify/webhook.ts";

function variant(color: string, length: string, index: number): ProductVariant {
  return {
    sku: `${color}-${length}-${index}`,
    ean: "",
    colorName: color,
    hex: "#111111",
    length,
    price: 12,
    inStock: true,
    colorFamily: "donker",
    sampleId: `${color}-${length}`,
  };
}

function product(index: number): Product {
  const colors = ["Antraciet", "Wit", "Groen"];
  const lengths = ["3 m", "4 m", "5 m", "6 m"];
  return {
    slug: `product-${index}`,
    name: `Product ${index}`,
    vendor: "Keralit",
    brand: "Keralit",
    brandSlug: "keralit",
    category: "gevelbekleding",
    description: "Deze lange beschrijving hoort niet in de kaart.",
    specs: [{ label: "Materiaal", value: "kunststof" }],
    relatedSlugs: ["ander-product"],
    variants: colors.flatMap((color, colorIndex) =>
      lengths.map((length, lengthIndex) => variant(color, length, colorIndex * 10 + lengthIndex)),
    ),
    price: 12,
    inStock: true,
    meta: "meta",
    palette: [],
    colors: colors.map((name) => ({
      name,
      hex: "#111111",
      family: "donker" as const,
      sampleId: name,
    })),
    length: "3 m",
    images: [{ url: "https://cdn.shopify.com/voorbeeld.jpg", alt: "Product" }],
    profileType: index % 2 === 0 ? "sponning" : "rabat",
    sampleable: true,
  };
}

test("listing card keeps one swatch per colour and every length", () => {
  const card = toListingCard(product(1));
  assert.equal(card.swatches.length, 3);
  assert.equal(JSON.stringify(card).includes("beschrijving"), false);
  assert.equal(JSON.stringify(card).includes("kunststof"), false);
  assert.equal(card.swatches[0]?.length, "3 m");
  assert.equal(card.swatches[0]?.lengths.length, 4);
  assert.equal(card.swatches[0]?.name, "Antraciet");
});

test("prepareListing returns ten cards per page from the full list", () => {
  const all = Array.from({ length: 25 }, (_, index) => product(index));
  const page = prepareListing(all, {}, 2);
  assert.equal(page.cards.length, 10);
  assert.equal(page.total, 25);
  assert.equal(page.cards[0]?.slug, "product-10");
  assert.equal(page.pages, 3);
  assert.ok(page.facets.profileTypes.length >= 1);
});

test("category page size is sixteen and relevantie keeps catalog order within a group", () => {
  const all = Array.from({ length: 20 }, (_, index) => product(index));
  const page = prepareListing(all, {}, 1, CATEGORY_PAGE_SIZE);
  assert.equal(page.cards.length, 16);
  assert.equal(page.pageSize, 16);
  assert.equal(page.pages, 2);
  assert.equal(page.cards[0]?.slug, "product-0");
  const byName = prepareListing(all, {}, 1, 20, "naam");
  assert.equal(byName.cards[0]?.slug, "product-0");
  assert.equal(byName.cards.at(-1)?.slug, "product-9");
});

test("relevantie puts panels before trim and accessories", () => {
  const foil = { ...product(0), slug: "folie", name: "Profol PE Folie", productGroup: "toebehoren" as const };
  const trim = { ...product(1), slug: "hoek", name: "Hoekprofiel", productGroup: "afwerkprofiel" as const };
  const panel = { ...product(2), slug: "paneel", name: "Rabatdeel", productGroup: "gevelpaneel" as const };
  const page = prepareListing([foil, trim, panel], {}, 1, 10);
  assert.deepEqual(
    page.cards.map((card) => card.slug),
    ["paneel", "hoek", "folie"],
  );
});

test("raster view rewrites and the default list does not", () => {
  assert.equal(
    listingRewriteTarget("/gevelbekleding", new URLSearchParams("weergave=raster")),
    "/weergave/categorie/gevelbekleding/p/1/weergave/raster",
  );
  assert.equal(listingRewriteTarget("/gevelbekleding", new URLSearchParams("weergave=lijst")), null);
  assert.equal(listingRewriteTarget("/gevelbekleding", new URLSearchParams("sorteer=naam")), "/weergave/categorie/gevelbekleding/p/1/sorteer/naam");
  const decoded = decodeListingState("categorie", "gevelbekleding", ["p", "1", "weergave", "raster"]);
  assert.equal(decoded?.search.get("weergave"), "raster");
});

test("pagina and filters rewrite to a cacheable path and back", () => {
  const search = new URLSearchParams("type=sponning&pagina=2");
  const path = listingRewriteTarget("/gevelbekleding", search);
  assert.equal(path, "/weergave/categorie/gevelbekleding/p/2/type/sponning");
  assert.equal(listingRewriteTarget("/gevelbekleding", new URLSearchParams("pagina=1")), null);
  assert.equal(listingRewriteTarget("/merken/keralit", new URLSearchParams()), null);

  const decoded = decodeListingState("categorie", "gevelbekleding", ["p", "2", "type", "sponning"]);
  assert.ok(decoded);
  const filters = parseListingSearchParams(Object.fromEntries(decoded.search.entries()));
  assert.equal(filters.profileType, "sponning");
  assert.equal(decoded.pagina, 2);

  const grouped = listingRewriteTarget("/gevelbekleding", new URLSearchParams("groep=gevelpaneel"));
  assert.equal(grouped, "/weergave/categorie/gevelbekleding/p/1/groep/gevelpaneel");
  const groupState = decodeListingState("categorie", "gevelbekleding", ["p", "1", "groep", "gevelpaneel"]);
  assert.equal(parseListingSearchParams(Object.fromEntries(groupState?.search.entries() ?? [])).productGroup, "gevelpaneel");
});

test("one filter value stays a single field and a single seo segment", () => {
  const filters = parseListingSearchParams({ merk: "keralit", type: "sponning", groep: "gevelpaneel" });
  assert.equal(filters.brandSlug, "keralit");
  assert.equal(filters.brandSlugs, undefined);
  assert.equal(filters.profileType, "sponning");
  assert.equal(filters.profileTypes, undefined);
  assert.equal(filters.productGroup, "gevelpaneel");
  assert.equal(filters.productGroups, undefined);
  assert.equal(
    listingHref("/gevelbekleding", { profileType: "sponning", colorFamily: "donker" }, {}),
    "/gevelbekleding?type=sponning&kleur=donker",
  );
});

test("several brands and colours share one param and round-trip through the rewrite", () => {
  const href = listingHref(
    "/gevelbekleding",
    { colorFamily: "donker" },
    { brandSlugs: ["keralit", "eurotexx"], colorSlugs: ["antraciet", "wit"] },
  );
  const params = new URLSearchParams(href.split("?")[1]);
  assert.equal(params.get("merk"), "keralit,eurotexx");
  assert.equal(params.get("kleurnaam"), "antraciet,wit");
  assert.equal(params.get("kleur"), "donker");
  const path = listingRewriteTarget("/gevelbekleding", params);
  assert.equal(
    path,
    "/weergave/categorie/gevelbekleding/p/1/merk/keralit%2Ceurotexx/kleur/donker/kleurnaam/antraciet%2Cwit",
  );
  const parts = path?.split("/").slice(1).map((part) => decodeURIComponent(part)) ?? [];
  const decoded = decodeListingState(parts[1] ?? "", parts[2] ?? "", parts.slice(3));
  assert.ok(decoded);
  const filters = parseListingSearchParams(Object.fromEntries(decoded.search.entries()));
  assert.deepEqual(filters.brandSlugs, ["keralit", "eurotexx"]);
  assert.equal(filters.brandSlug, undefined);
  assert.equal(filters.colorFamily, "donker");
  assert.deepEqual(filters.colorSlugs, ["antraciet", "wit"]);
});

test("a brand click keeps the colour filter and one remaining brand stays singular", () => {
  const current = { colorFamily: "donker" as const, brandSlugs: ["keralit", "eurotexx"] };
  const href = listingHref("/gevelbekleding", current, { brandSlugs: ["eurotexx"] });
  const params = new URLSearchParams(href.split("?")[1]);
  assert.equal(params.get("merk"), "eurotexx");
  assert.equal(params.get("kleur"), "donker");
  const next = mergeListingFilters(current, { brandSlugs: ["eurotexx"] });
  assert.equal(next.brandSlug, "eurotexx");
  assert.equal(next.brandSlugs, undefined);
  assert.equal(next.colorFamily, "donker");
});

test("filters combine with or inside a dimension and and across dimensions", () => {
  const panel = { ...product(1), slug: "paneel", productGroup: "gevelpaneel" as const };
  const otherBrand = {
    ...product(2),
    slug: "euro",
    brand: "Eurotexx",
    brandSlug: "eurotexx",
    productGroup: "gevelpaneel" as const,
  };
  const trim = { ...product(3), slug: "hoek", productGroup: "afwerkprofiel" as const };
  const green = {
    ...product(4),
    slug: "groen-only",
    productGroup: "gevelpaneel" as const,
    colors: [{ name: "Groen", hex: "#080", family: "groen" as const, sampleId: "groen" }],
  };
  const matched = applyListingFilters([panel, otherBrand, trim, green], {
    brandSlugs: ["keralit", "eurotexx"],
    productGroup: "gevelpaneel",
    colorSlugs: ["antraciet", "wit"],
  });
  assert.deepEqual(
    matched.map((item) => item.slug).sort(),
    ["euro", "paneel"],
  );
});

test("colour facets stay in family order and a search can match the code", () => {
  const dark = { ...product(1), slug: "dark", colors: [{ name: "Zwart", hex: "#111", family: "donker" as const, sampleId: "zwart" }] };
  const lightA = { ...product(2), slug: "creme", colors: [{ name: "Creme", hex: "#eee", family: "licht" as const, sampleId: "creme" }] };
  const lightB = { ...product(3), slug: "wit", colors: [{ name: "Wit", hex: "#fff", family: "licht" as const, sampleId: "wit" }] };
  const wood = { ...product(4), slug: "eiken", colors: [{ name: "Eiken", hex: "#864", family: "houtlook" as const, sampleId: "eiken" }] };
  const facets = listingFacets([lightB, lightA, wood, dark]);
  assert.deepEqual(
    facets.sheetColors.map((color) => color.slug),
    ["zwart", "creme", "wit", "eiken"],
  );
  assert.equal(colourFilterMatches("Antraciet (A24)", slugKey("Antraciet (A24)"), "antraciet"), true);
  assert.equal(colourFilterMatches("Antraciet (A24)", slugKey("Antraciet (A24)"), "A24"), true);
  assert.equal(colourFilterMatches("Antraciet (A24)", slugKey("Antraciet (A24)"), "A21"), false);
  assert.equal(colourFilterMatches("Antraciet", "antraciet", "A24"), true);
  assert.equal(colourFilterMatches("Antraciet wildverband", "antraciet-wildverband", "A24"), false);
  assert.equal(colourFilterMatches("Wit", "wit", "A24"), false);
});

test("webhook hmac accepts the raw body and rejects a tampered one", () => {
  const body = '{"id":1}';
  const secret = "test-secret";
  const header = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  assert.equal(verifyShopifyWebhookHmac(body, header, secret), true);
  assert.equal(verifyShopifyWebhookHmac(`${body} `, header, secret), false);
  assert.equal(verifyShopifyWebhookHmac(body, header, ""), false);
});

test("shopify ids keep the trailing number", () => {
  assert.equal(shopifyNumericId("gid://shopify/Product/1091"), "1091");
  assert.equal(shopifyNumericId(1091), "1091");
});
