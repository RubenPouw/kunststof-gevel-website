import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createKozijnDraftOrder, productionBookHasNoPrices } from "../src/lib/kozijnen/checkout.ts";
import { PROFILE, SIZE_LIMITS } from "../src/lib/kozijnen/config.ts";
import { getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig, defaultLaminated, parseConfig, serializeConfig, sizeInRange } from "../src/lib/kozijnen/model.ts";
import { buildPdf, quotePdfLines } from "../src/lib/kozijnen/pdf.ts";
import { calculatePrice, priceBook, type PriceBook } from "../src/lib/kozijnen/prices.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { summaryText } from "../src/lib/kozijnen/text.ts";

test("EKO profile keeps unconfirmed numbers empty", () => {
  assert.equal(PROFILE.name, "EKO NL Profiel");
  assert.equal(PROFILE.uwHrpp, null);
  assert.equal(PROFILE.uwTriple, null);
  assert.equal(PROFILE.chambers, null);
  assert.equal(PROFILE.depthMm, null);
  assert.equal(PROFILE.leadTimeWorkdays, null);
  assert.equal(PROFILE.warranty, null);
  assert.deepEqual(PROFILE.certificates, []);
  const source = readFileSync(new URL("../src/lib/kozijnen/config.ts", import.meta.url), "utf8");
  assert.match(source, /TODO\(EKO\): Uw/);
  assert.match(source, /TODO\(EKO\): aantal kamers/);
  assert.match(source, /TODO\(EKO\): inbouwdiepte/);
});

test("online size defaults come from the config, not a client price", () => {
  const dk = SIZE_LIMITS.draaikiepraam;
  assert.equal(dk.minWidth, 602);
  assert.equal(dk.maxWidth, 1384);
  assert.equal(SIZE_LIMITS["schuifpui-2-delig"].minWidth, 1600);
  assert.equal(SIZE_LIMITS["openslaande-tuindeuren"].minHeight, 1960);
  const layout = getLayoutBySlug("draaikiepraam");
  assert.ok(layout);
  assert.equal(sizeInRange(layout, 1000, 1200), true);
  assert.equal(sizeInRange(layout, 1500, 1200), false);
});

test("laminated glass follows doors and low sills", () => {
  const door = getLayoutBySlug("tuindeur");
  const raam = getLayoutBySlug("draaikiepraam");
  assert.ok(door && raam);
  assert.equal(defaultLaminated(door, "nee"), "beide");
  assert.equal(defaultLaminated(raam, "ja"), "binnen");
  assert.equal(defaultLaminated(raam, "nee"), "geen");
  const config = parseConfig(new URLSearchParams("b=1000&h=1200&onder=ja"), raam);
  assert.equal(config.laminated, "binnen");
  const kept = parseConfig(new URLSearchParams("onder=ja&gel=geen&gelvast=1"), raam);
  assert.equal(kept.laminated, "geen");
  assert.equal(kept.laminatedTouched, true);
});

test("a shared url roundtrips without a price", () => {
  const layout = getLayoutBySlug("stolpraam");
  assert.ok(layout);
  const start = defaultConfig(layout);
  start.frameOut = "7016";
  start.active = "links";
  start.step = "kleur";
  const again = parseConfig(new URLSearchParams(serializeConfig(start)), layout);
  assert.equal(again.frameOut, "7016");
  assert.equal(again.active, "links");
  assert.equal(again.step, "kleur");
  assert.equal(summaryText(again).includes("€"), false);
});

test("price engine stays quiet until the book and the flag are filled", () => {
  assert.equal(productionBookHasNoPrices(), true);
  const quiet = calculatePrice({ layout: "draaikiepraam", areaM2: 1.2, optionIds: ["beslag.rc2"] }, priceBook, false);
  assert.deepEqual(quiet, { pricesActive: false });
  const incomplete = calculatePrice({ layout: "draaikiepraam", areaM2: 1.2, optionIds: [] }, priceBook, true);
  assert.equal(incomplete.pricesActive, false);

  const book: PriceBook = {
    marginPercent: 10,
    types: { "draaikiepraam": { base: 100, perM2: 50 } },
    options: [{ id: "kleur.buiten", label: "Folie buiten", mode: "percent", amount: 20 }],
  };
  const priced = calculatePrice({ layout: "draaikiepraam", areaM2: 2, optionIds: ["kleur.buiten"] }, book, true);
  assert.equal(priced.pricesActive, true);
  if (!priced.pricesActive) return;
  assert.equal(priced.totalExcl, 264);
  assert.equal(priced.lines.some((line) => line.id === "kleur.buiten"), true);
});

test("draft order checkout does not call Shopify while the flags are off", async () => {
  let called = false;
  const result = await createKozijnDraftOrder(
    {
      title: "Draaikiepraam",
      properties: [],
      price: { pricesActive: false },
      email: "a@b.nl",
    },
    {},
    async () => {
      called = true;
      return new Response("{}");
    },
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "uit");
  assert.equal(called, false);
});

test("quote pdf has no amount", () => {
  const bytes = buildPdf(quotePdfLines({ title: "Draaikiepraam", lines: [{ label: "Profiel", value: "EKO NL Profiel" }] }));
  const text = Buffer.from(bytes).toString("latin1");
  assert.match(text, /Vrijblijvende offerteaanvraag/);
  assert.equal(text.includes("€"), false);
  assert.match(text, /Er staat geen prijs op/);
});

test("/kozijnen redirects in one hop to the new hub", () => {
  const row = lookupRedirect("/kozijnen");
  assert.equal(row.status, "301");
  assert.equal(row.to, "/kunststof-kozijnen");
  const legacy = lookupRedirect("/kunststof-kozijnen-op-maat-prijs-berekenen-snel-geleverd");
  assert.equal(legacy.to, "/kunststof-kozijnen");
});

test("kozijn pages do not ship review markup or the price module to the client", () => {
  const files = [
    "../src/components/kozijnen/configurator.tsx",
    "../src/app/kunststof-kozijnen/page.tsx",
    "../src/app/kunststof-kozijnen/[group]/[slug]/page.tsx",
    "../src/lib/kozijnen/schema.ts",
  ];
  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.equal(source.includes("AggregateRating"), false, file);
    assert.equal(source.includes("kozijnen/prices"), false, file);
    assert.equal(source.includes("Kömmerling"), false, file);
  }
});
