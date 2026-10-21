import assert from "node:assert/strict";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import type { Product, ProductVariant } from "../src/lib/catalog/types.ts";
import { customerStaalText } from "../src/lib/staal/messages.ts";
import { rateLimitStaal, resetStaalRateLimit } from "../src/lib/staal/rate-limit.ts";
import {
  STAAL_BOTH_NOTE,
  STAAL_GROUP_QUESTION,
  STAAL_MULTI_NOTE,
  STAAL_PRICE_NO,
  STAAL_PRICE_QUESTION,
  STAAL_PRICE_YES,
  buildStaalTree,
  pathForProduct,
  staalSteps,
  staalTarget,
  type StaalNode,
} from "../src/lib/staal/tree.ts";
import { parseStaalRequest, resolveStaalLine, validateStaalRequest } from "../src/lib/staal/validate.ts";
import { lookupRedirect, resolveNavigation } from "../src/lib/seo/redirects.ts";
import { site } from "../src/lib/site.ts";

function variant(colorName: string): ProductVariant {
  return {
    sku: colorName,
    ean: "",
    colorName,
    hex: "#333333",
    length: "1 m",
    price: 10,
    inStock: true,
    colorFamily: "overig",
    sampleId: `test:${colorName}`,
  };
}

function product(partial: Partial<Product> & Pick<Product, "slug" | "name">): Product {
  return {
    vendor: "Test",
    brand: "Test",
    brandSlug: "test",
    category: "gevelbekleding",
    description: "",
    specs: [],
    relatedSlugs: [],
    variants: [variant("Antraciet")],
    price: 10,
    inStock: true,
    meta: "",
    palette: [],
    colors: [],
    length: "1 m",
    images: [],
    profileType: "steenstrip",
    sampleable: true,
    ...partial,
  };
}

function labels(node: StaalNode): string[] {
  return [node.label, ...(node.children ?? []).flatMap(labels)];
}

const tree = buildStaalTree(staticProducts);

test("staalaanvraag keeps the four groups and the Fillout questions", () => {
  assert.deepEqual(
    tree.groups.map((group) => group.label),
    ["Gevel paneel", "Dakrand", "Vensterbanken", "HPL platen"],
  );
  assert.equal(STAAL_GROUP_QUESTION, "Kiest u eerst voor wat er nodig is, dakrand of een geveldeel?");
  assert.match(STAAL_BOTH_NOTE, /Bijbestellen/);
  assert.match(STAAL_MULTI_NOTE, /Meerdere stalen zijn mogelijk/);
  assert.equal(
    STAAL_PRICE_QUESTION,
    "Wil je alvast vrijblijvend een prijsindicatie of offerte ontvangen voor jouw project?",
  );
  assert.equal(STAAL_PRICE_YES, "Ja, ik wil graag een prijs indicatie");
  assert.equal(STAAL_PRICE_NO, "Nee direct stalen ontvangen!");
  for (const text of [STAAL_GROUP_QUESTION, STAAL_BOTH_NOTE, STAAL_MULTI_NOTE, STAAL_PRICE_QUESTION]) {
    assert.equal(text.includes("\u2014") || text.includes("\u2013"), false);
  }
});

test("gevel splits potdeksel by brand and sponning by product", () => {
  const gevel = tree.groups.find((group) => group.id === "gevel");
  assert.ok(gevel);
  const potdeksel = gevel.children?.find((child) => child.id === "potdeksel");
  assert.equal(potdeksel?.question, "Merk Potdeksel");
  assert.deepEqual(potdeksel?.children?.map((child) => child.label).sort(), ["Eurotexx", "Keralit"]);
  assert.ok(potdeksel?.children?.every((child) => child.colors.length > 1 && !child.skipColor));

  const sponning = gevel.children?.find((child) => child.id === "sponning");
  assert.equal(sponning?.question, "Kies het soort paneel");
  const sponningText = sponning?.children?.map((child) => child.label).join(" | ") ?? "";
  assert.match(sponningText, /143/);
  assert.match(sponningText, /167/);
  assert.match(sponningText, /190/);
  assert.match(sponningText, /Rabat/);
  assert.doesNotMatch(sponningText, /Quattro/);

  const multi = gevel.children?.find((child) => child.id === "multisponning");
  assert.equal(multi?.question, "Kies het soort Multisponning");
  const multiText = multi?.children?.map((child) => child.label).join(" | ") ?? "";
  assert.match(multiText, /Quattro/);
  assert.match(multiText, /Multi/);
  assert.match(multiText, /dubbel/i);
  assert.equal(labels(gevel).some((label) => /hoekstuk|eindprofiel|schroef/i.test(label)), false);
});

test("dakrand lists panels and drops profiles, corners and caps", () => {
  const dakrand = tree.groups.find((group) => group.id === "dakrand");
  assert.ok(dakrand);
  const text = labels(dakrand).join(" | ");
  assert.match(text, /dakrand paneel|Dakrandpaneel/i);
  assert.doesNotMatch(text, /eindprofiel|montage|verbinding|hoek/i);
  const found = pathForProduct(tree, "keralit-dakrand-paneel-200");
  assert.ok(found);
  assert.equal(found.groupId, "dakrand");
  assert.equal(found.choiceIds.length, 1);
});

test("vensterbank uses the overzetbank and skips a single product step", () => {
  const found = pathForProduct(tree, "milinboard-overzetvensterbank-380");
  assert.ok(found);
  assert.equal(found.groupId, "vensterbank");
  assert.deepEqual(found.choiceIds, []);
  const built = staalSteps(tree, { groupId: found.groupId, choiceIds: found.choiceIds, extraLine: false });
  assert.match(built.leaf?.label ?? "", /Overzetvensterbank|Milinboard/);
  assert.equal(built.steps.some((step) => step.type === "choose"), false);
  const text = labels(tree.groups.find((group) => group.id === "vensterbank")!).join(" | ");
  assert.doesNotMatch(text, /Eindkap/);
});

test("hpl samples are only Flexinplex around 6 mm", () => {
  assert.deepEqual(tree.groups.find((group) => group.id === "hpl")?.productSlugs, []);
  const sheet = product({
    slug: "flex-6",
    name: "Flexinplex plaat 3050 x 1300 x 6 mm",
    brand: "Flexinplex",
    vendor: "Flexinplex",
    category: "hpl-platen",
    saleUnit: "sheet",
    variants: [variant("Eiken"), variant("Wit")],
  });
  const thin = product({
    slug: "flex-2",
    name: "Flexinplex 2 mm",
    brand: "Flexinplex",
    vendor: "Flexinplex",
    category: "hpl-platen",
    variants: [variant("Eiken"), variant("Wit")],
  });
  const compact = product({
    slug: "compact",
    name: "HPL Compact Exterieur 6 mm",
    brand: "HPL Compact Exterieur",
    vendor: "HPL",
    category: "hpl-platen",
    variants: [variant("Eiken"), variant("Wit")],
  });
  const built = buildStaalTree([sheet, thin, compact]);
  assert.deepEqual(built.groups.find((group) => group.id === "hpl")?.productSlugs, ["flex-6"]);
  assert.equal(staalTarget(sheet)?.groupId, "hpl");
  assert.equal(staalTarget(compact), null);
});

test("zierer leisteen skips the colour step only when there is no real choice", () => {
  const one = product({ slug: "zierer-leisteen", name: "Zierer leisteen", brand: "Zierer", brandSlug: "zierer" });
  const many = product({
    slug: "zierer-leisteen-kleur",
    name: "Zierer leisteen",
    brand: "Zierer",
    brandSlug: "zierer",
    variants: [variant("Antraciet"), variant("Grijs")],
  });
  const singleTree = buildStaalTree([one]);
  const singlePath = pathForProduct(singleTree, one.slug);
  assert.ok(singlePath);
  const singleSteps = staalSteps(singleTree, { ...singlePath, extraLine: false });
  assert.equal(singleSteps.leaf?.skipColor, true);
  assert.equal(singleSteps.steps.some((step) => step.type === "color"), false);

  const multiTree = buildStaalTree([many]);
  const multiPath = pathForProduct(multiTree, many.slug);
  assert.ok(multiPath);
  const multiSteps = staalSteps(multiTree, { ...multiPath, extraLine: false });
  assert.equal(multiSteps.leaf?.skipColor, false);
  assert.equal(multiSteps.steps.some((step) => step.type === "color"), true);
});

test("validation accepts a catalog colour and a skipped colour", () => {
  const pot = pathForProduct(tree, "keralit-potdeksel-177");
  assert.ok(pot);
  const built = staalSteps(tree, { ...pot, extraLine: false });
  assert.ok(built.leaf);
  const colorId = built.leaf.colors[0]?.id ?? "";
  const base = {
    companyWebsite: "",
    wantsQuote: false,
    name: "Jan",
    email: "jan@example.com",
    phone: "0612345678",
    postcode: "3454 WZ",
    houseNumber: "6",
  };
  assert.equal(
    validateStaalRequest({ ...base, lines: [{ path: built.expandedPath, colorIds: [colorId] }] }, tree),
    null,
  );
  assert.match(
    validateStaalRequest({ ...base, lines: [{ path: built.expandedPath, colorIds: [] }] }, tree) ?? "",
    /kleur/i,
  );
  assert.match(
    validateStaalRequest({ ...base, lines: [{ path: built.expandedPath, colorIds: ["geen-kleur"] }] }, tree) ?? "",
    /catalogus/i,
  );

  const leisteen = product({ slug: "zierer-leisteen", name: "Zierer leisteen", brand: "Zierer", brandSlug: "zierer" });
  const leisteenTree = buildStaalTree([leisteen]);
  const leisteenPath = pathForProduct(leisteenTree, leisteen.slug);
  assert.ok(leisteenPath);
  const leisteenSteps = staalSteps(leisteenTree, { ...leisteenPath, extraLine: false });
  const resolved = resolveStaalLine(leisteenTree, { path: leisteenSteps.expandedPath, colorIds: [] });
  assert.equal("error" in resolved, false);
  if (!("error" in resolved)) assert.deepEqual(resolved.colorIds, ["antraciet"]);
  assert.equal(
    validateStaalRequest({ ...base, lines: [{ path: leisteenSteps.expandedPath, colorIds: [] }] }, leisteenTree),
    null,
  );
  assert.equal(parseStaalRequest({ wantsQuote: "ja" }), null);
  const honeypot = parseStaalRequest({ ...base, companyWebsite: "https://spam.test", lines: [] });
  assert.equal(honeypot?.companyWebsite, "https://spam.test");
});

test("rate limit allows five posts per ten minutes", () => {
  resetStaalRateLimit();
  for (let hit = 0; hit < 5; hit += 1) assert.equal(rateLimitStaal("203.0.113.5", 1_000), true);
  assert.equal(rateLimitStaal("203.0.113.5", 1_000), false);
  assert.equal(rateLimitStaal("203.0.113.5", 1_000 + 10 * 60 * 1000), true);
});

test("/staalaanvraag is the page, not a redirect to /stalen", () => {
  const row = lookupRedirect("/staalaanvraag");
  assert.equal(row.to, "/staalaanvraag");
  assert.equal(row.status, "200");
  const decision = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/staalaanvraag",
    search: "",
  });
  assert.equal(decision.action, "next");
});

test("customer mail uses the thank-you sentence and the published phone numbers", () => {
  const text = customerStaalText({
    reference: "ST-1",
    lines: ["Keralit: Wit 9016"],
    name: "Jan",
    phone: "0612345678",
    postcode: "3454 WZ",
    houseNumber: "6",
    wantsQuote: false,
  });
  assert.match(text, /Je staal wordt binnen een dag verstuurd/);
  assert.match(text, new RegExp(site.phone.replace(/ /g, " ")));
  assert.match(text, /31613639368|06 13639368|\+31 6 13639368/);
  assert.equal(text.includes("\u2014") || text.includes("\u2013"), false);
  assert.equal(/\p{Extended_Pictographic}/u.test(text), false);
  assert.equal(/085[\s-]*401|06[\s-]*46011057/.test(text), false);
});
