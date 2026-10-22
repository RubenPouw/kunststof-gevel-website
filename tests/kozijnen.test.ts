import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createKozijnDraftOrder, productionBookHasNoPrices } from "../src/lib/kozijnen/checkout.ts";
import { PROFILE, SIZE_LIMITS } from "../src/lib/kozijnen/config.ts";
import { getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig, defaultLaminated, parseConfig, resumeVisible, serializeConfig, sizeInRange } from "../src/lib/kozijnen/model.ts";
import { buildPdf, quotePdfLines } from "../src/lib/kozijnen/pdf.ts";
import { calculatePrice, priceBook, type PriceBook } from "../src/lib/kozijnen/prices.ts";
import { CLAIMS, SUPPLIER } from "../src/lib/kozijnen/supplier.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { summaryText } from "../src/lib/kozijnen/text.ts";

test("Aluplast profile keeps unconfirmed numbers empty", () => {
  assert.equal(PROFILE.name, "Aluplast Ideal 7000 NL");
  assert.equal(PROFILE.systemName, "Aluplast Ideal 7000 NL 64 mm");
  assert.equal(PROFILE.uwHrpp, null);
  assert.equal(PROFILE.uwTriple, null);
  assert.equal(PROFILE.chambers, null);
  assert.equal(PROFILE.depthMm, null);
  assert.equal(PROFILE.leadTimeWorkdays, null);
  assert.equal(PROFILE.warranty, null);
  assert.deepEqual(PROFILE.certificates, []);
  assert.deepEqual(PROFILE.cornerVariants, ["verstek", "hvl"]);
  assert.equal(CLAIMS.rc2, false);
  assert.equal(CLAIMS.pkvw, false);
  assert.equal(CLAIMS.skg, false);
  assert.equal(CLAIMS.komo, false);
  assert.equal(SUPPLIER.name, "EKO");
  const source = readFileSync(new URL("../src/lib/kozijnen/config.ts", import.meta.url), "utf8");
  assert.match(source, /TODO\(leverancier\): Uw/);
  assert.match(source, /TODO\(leverancier\): aantal kamers/);
  assert.match(source, /TODO\(leverancier\): inbouwdiepte/);
  assert.equal(/EKO|eko4u/i.test(source), false);
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

test("selling price is purchase times 1.80 and stays hidden without purchase amounts", () => {
  assert.equal(priceBook.marginPercent, 80);
  assert.equal(priceBook.options.find((option) => option.id === "ventilatie.rooster")?.marginPercent, 50);
  assert.equal(
    priceBook.options.filter((option) => option.id !== "ventilatie.rooster").every((option) => option.marginPercent == null),
    true,
  );
  assert.equal(productionBookHasNoPrices(), true);
  const quiet = calculatePrice({ layout: "draaikiepraam", areaM2: 1.2, optionIds: ["beslag.zwaar"] }, priceBook, false);
  assert.deepEqual(quiet, { pricesActive: false });
  const incomplete = calculatePrice({ layout: "draaikiepraam", areaM2: 1.2, optionIds: [] }, priceBook, true);
  assert.equal(incomplete.pricesActive, false);

  const book: PriceBook = {
    marginPercent: 80,
    types: { "draaikiepraam": { base: 100, perM2: 50 } },
    options: [{ id: "kleur.buiten", label: "Folie buiten", mode: "percent", amount: 20 }],
  };
  const priced = calculatePrice({ layout: "draaikiepraam", areaM2: 2, optionIds: ["kleur.buiten"] }, book, true);
  assert.equal(priced.pricesActive, true);
  if (!priced.pricesActive) return;
  assert.equal(priced.totalExcl, 432);
  assert.equal(priced.totalIncl, 522.72);
  assert.equal(priced.lines.some((line) => line.id === "marge"), false);
  const colour = priced.lines.find((line) => line.id === "kleur.buiten");
  assert.equal(colour?.amountExcl, 72);

  const mixed: PriceBook = {
    marginPercent: 80,
    types: { draaikiepraam: { base: 100, perM2: 50 } },
    options: [
      { id: "kleur.buiten", label: "Folie buiten", mode: "percent", amount: 20 },
      { id: "ventilatie.rooster", label: "Ventilatierooster", mode: "fixed", amount: 100, marginPercent: 50 },
    ],
  };
  const withVent = calculatePrice(
    { layout: "draaikiepraam", areaM2: 2, optionIds: ["kleur.buiten", "ventilatie.rooster"] },
    mixed,
    true,
  );
  assert.equal(withVent.pricesActive, true);
  if (!withVent.pricesActive) return;
  assert.equal(withVent.lines.find((line) => line.id === "basis")?.amountExcl, 360);
  assert.equal(withVent.lines.find((line) => line.id === "kleur.buiten")?.amountExcl, 72);
  assert.equal(withVent.lines.find((line) => line.id === "ventilatie.rooster")?.amountExcl, 150);
  assert.equal(withVent.totalExcl, 582);
  assert.equal(withVent.totalIncl, 704.22);
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

test("windows open inward and doors keep a direction choice", () => {
  const raam = getLayoutBySlug("draaikiepraam");
  const deur = getLayoutBySlug("tuindeur");
  assert.ok(raam && deur);
  assert.equal(raam.chooseDirection, false);
  assert.equal(raam.defaultDirection, "binnen");
  assert.equal(deur.chooseDirection, true);
  const forced = parseConfig(new URLSearchParams("draai=buiten"), raam);
  assert.equal(forced.direction, "binnen");
  const chosen = parseConfig(new URLSearchParams("draai=binnen&hoek=hvl"), deur);
  assert.equal(chosen.direction, "binnen");
  assert.equal(chosen.corner, "hvl");
  assert.equal(resumeVisible("maten", true), true);
  assert.equal(resumeVisible("hoek", true), false);
  assert.equal(resumeVisible("overzicht", true), false);
});

test("quote pdf has no amount and names the public profile", () => {
  const bytes = buildPdf(quotePdfLines({ title: "Draaikiepraam", lines: [{ label: "Profiel", value: PROFILE.name }] }));
  const text = Buffer.from(bytes).toString("latin1");
  assert.match(text, /Vrijblijvende offerteaanvraag/);
  assert.match(text, /Aluplast Ideal 7000 NL/);
  assert.equal(text.includes("€"), false);
  assert.equal(/EKO/i.test(text), false);
  assert.match(text, /Er staat geen prijs op/);
});

test("/kozijnen redirects in one hop to the new hub", () => {
  const row = lookupRedirect("/kozijnen");
  assert.equal(row.status, "301");
  assert.equal(row.to, "/kunststof-kozijnen");
  const legacy = lookupRedirect("/kunststof-kozijnen-op-maat-prijs-berekenen-snel-geleverd");
  assert.equal(legacy.to, "/kunststof-kozijnen");
});

test("kozijn pages do not ship review markup, the price module, or hidden supplier names", () => {
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
    assert.equal(source.includes("kozijnen/supplier"), false, file);
    assert.equal(source.includes("Kömmerling"), false, file);
  }

  const banned = /\bEKO\b|eko4u|eko-nl|\bRC2\b|\bPKVW\b|\bKOMO\b|\bSKG\b|hefschuif|brievenbus|bovenlicht|\bvoordeur\b|Politiekeurmerk|1,80|marginPercent/i;
  const roots = ["../src/components/kozijnen", "../src/app/kunststof-kozijnen", "../src/lib/kozijnen"];
  const skip = new Set(["supplier.ts", "prices.ts", "checkout.ts"]);
  for (const root of roots) {
    for (const file of walk(fileURLToPath(new URL(root, import.meta.url)))) {
      if (skip.has(file.split("/").pop() ?? "")) continue;
      const source = readFileSync(file, "utf8");
      assert.equal(banned.test(source), false, file);
    }
  }
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}
