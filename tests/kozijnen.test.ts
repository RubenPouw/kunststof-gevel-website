import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createKozijnDraftOrder } from "../src/lib/kozijnen/checkout.ts";
import { PROFILE, SIZE_LIMITS, SLIDING_NAME, publicProfileName } from "../src/lib/kozijnen/config.ts";
import { getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { defaultConfig, defaultLaminated, parseConfig, resumeVisible, serializeConfig, sizeInRange } from "../src/lib/kozijnen/model.ts";
import { buildPdf, quotePdfLines } from "../src/lib/kozijnen/pdf.ts";
import { calculatePrice, optionIdsFor, priceBook, pricesFlagActive, publicPrice, type PriceBook, type PriceInput } from "../src/lib/kozijnen/prices.ts";
import { CLAIMS, SUPPLIER } from "../src/lib/kozijnen/supplier.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { summaryText } from "../src/lib/kozijnen/text.ts";

test("Aluplast profile publishes confirmed specs and keeps certificates empty", () => {
  assert.equal(PROFILE.name, "Aluplast Ideal 7000 NL");
  assert.equal(PROFILE.systemName, "Aluplast Ideal 7000 NL 64 mm");
  assert.equal(PROFILE.frameChambers, 3);
  assert.equal(PROFILE.sashChambers, 5);
  assert.equal(PROFILE.gaskets, 2);
  assert.equal(PROFILE.glassMaxMm, 52);
  assert.equal(PROFILE.depthMm, 120);
  assert.equal(PROFILE.uwDouble, 1.3);
  assert.equal(PROFILE.uwTriple, 1.1);
  assert.equal(PROFILE.uwWithVent, 1.4);
  assert.equal(PROFILE.leadTimeWorkdays, null);
  assert.equal(PROFILE.warranty, null);
  assert.deepEqual(PROFILE.certificates, []);
  assert.deepEqual(PROFILE.cornerVariants, ["verstek", "hvl"]);
  assert.equal(publicProfileName("schuifpui-2-delig"), SLIDING_NAME);
  assert.equal(publicProfileName("schuifpui-4-delig"), "Kunststof schuifpui");
  assert.equal(publicProfileName("draaikiepraam"), PROFILE.name);
  assert.equal(CLAIMS.rc2, false);
  assert.equal(CLAIMS.pkvw, false);
  assert.equal(CLAIMS.skg, false);
  assert.equal(CLAIMS.komo, false);
  assert.equal(SUPPLIER.name, "EKO");
  const source = readFileSync(new URL("../src/lib/kozijnen/config.ts", import.meta.url), "utf8");
  assert.equal(/EKO|eko4u/i.test(source), false);
  assert.equal(/garantie|levertijd|certificaat/i.test(source), true);
});

test("online size defaults come from the config, not a client price", () => {
  const dk = SIZE_LIMITS.draaikiepraam;
  assert.equal(dk.minWidth, 600);
  assert.equal(dk.maxWidth, 1512);
  assert.equal(dk.maxSashWidth, 1512);
  assert.equal(SIZE_LIMITS["vast-raam"].maxAreaM2, 3.35);
  assert.equal(SIZE_LIMITS["schuifpui-2-delig"].minWidth, 1600);
  assert.equal(SIZE_LIMITS["openslaande-tuindeuren"].minHeight, 1960);
  const layout = getLayoutBySlug("draaikiepraam");
  const vast = getLayoutBySlug("vast-raam");
  assert.ok(layout && vast);
  assert.equal(sizeInRange(layout, 1000, 1200), true);
  assert.equal(sizeInRange(layout, 600, 600), true);
  assert.equal(sizeInRange(layout, 1512, 1200), true);
  assert.equal(sizeInRange(layout, 1513, 1200), false);
  assert.equal(sizeInRange(layout, 599, 600), false);
  assert.equal(sizeInRange(vast, 2000, 1675), true);
  assert.equal(sizeInRange(vast, 2000, 1676), false);
  assert.equal(sizeInRange(vast, 600, 600), true);
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

function plain(layout: string, widthMm: number, heightMm: number, panes: PriceInput["panes"]): PriceInput {
  return { layout, widthMm, heightMm, panes, optionIds: [] };
}

test("selling price is purchase times the markup and the flag stays off", () => {
  assert.equal(priceBook.marginPercent, 80);
  assert.equal(pricesFlagActive({}), false);
  assert.equal(pricesFlagActive({ KOZIJNEN_PRIJZEN_ACTIEF: "true" }), true);
  assert.equal(priceBook.options.find((option) => option.id === "ventilatie.rooster")?.marginPercent, 50);
  assert.equal(priceBook.options.find((option) => option.id === "ventilatie.duco")?.marginPercent, 50);
  assert.equal(priceBook.options.find((option) => option.id === "ventilatie.duco")?.amount, null);
  for (const id of ["afstandhouder.zwart", "roeden.met", "kleur.ral", "kruk.kleur"]) {
    const option = priceBook.options.find((item) => item.id === id);
    assert.equal(option?.amount, null, id);
    assert.equal(option?.marginPercent, undefined, id);
  }
  const quiet = calculatePrice(plain("draaikiepraam", 1000, 1200, [{ kind: "draaikiep", flex: 1 }]), priceBook, false);
  assert.deepEqual(quiet, { pricesActive: false });
  const quoteOnly = calculatePrice(plain("schuifpui-4-delig", 4000, 2100, []), priceBook, true);
  assert.equal(quoteOnly.pricesActive, false);
  const missing = calculatePrice(
    { ...plain("draaikiepraam", 1000, 1200, [{ kind: "draaikiep", flex: 1 }]), optionIds: ["hor.inzet"] },
    priceBook,
    true,
  );
  assert.equal(missing.pricesActive, false);

  const dk = publicPrice(calculatePrice(plain("draaikiepraam", 1000, 1200, [{ kind: "draaikiep", flex: 1 }]), priceBook, true));
  const vast = publicPrice(calculatePrice(plain("vast-raam", 1000, 1200, [{ kind: "vast", flex: 1 }]), priceBook, true));
  const door = publicPrice(calculatePrice(plain("tuindeur", 1000, 2100, [{ kind: "deur", flex: 1 }]), priceBook, true));
  const slide = publicPrice(calculatePrice(plain("schuifpui-2-delig", 2000, 2100, []), priceBook, true));
  assert.deepEqual(dk, { pricesActive: true, totalExcl: 461.27, totalIncl: 558.14 });
  assert.deepEqual(vast, { pricesActive: true, totalExcl: 330.47, totalIncl: 399.87 });
  assert.deepEqual(door, { pricesActive: true, totalExcl: 1497.23, totalIncl: 1811.65 });
  assert.deepEqual(slide, { pricesActive: true, totalExcl: 2763.67, totalIncl: 3344.04 });
  for (const row of [dk, vast, door, slide]) {
    assert.equal("lines" in row, false);
  }

  const combo = getLayoutBySlug("draaikiepraam-met-vast-raam");
  assert.ok(combo);
  const summed = calculatePrice(
    plain("draaikiepraam-met-vast-raam", 2000, 1200, combo.panes),
    priceBook,
    true,
  );
  assert.equal(summed.pricesActive, true);
  if (!summed.pricesActive) return;
  assert.equal(summed.totalExcl, 791.74);

  const corner = calculatePrice(
    { ...plain("draaikiepraam", 1000, 1200, [{ kind: "draaikiep", flex: 1 }]), optionIds: ["hoek.hvl"] },
    priceBook,
    true,
  );
  assert.equal(corner.pricesActive, true);
  if (!corner.pricesActive) return;
  assert.equal(corner.totalExcl, 552.68);

  const book: PriceBook = {
    marginPercent: 80,
    paneVast: { base: 0, perMeter: 0, perM2: 0 },
    paneTurnTilt: { base: 0, perMeter: 0, perM2: 0 },
    layouts: { draaikiepraam: { mode: "rect", curve: { base: 100, perMeter: 0, perM2: 50 } } },
    options: [
      { id: "kleur.buiten", label: "Folie buiten", mode: "percent", amount: 20 },
      { id: "ventilatie.rooster", label: "Ventilatierooster", mode: "fixed", amount: 100, marginPercent: 50 },
    ],
  };
  const priced = calculatePrice(
    { ...plain("draaikiepraam", 1000, 2000, [{ kind: "draaikiep", flex: 1 }]), optionIds: ["kleur.buiten", "ventilatie.rooster"] },
    book,
    true,
  );
  assert.equal(priced.pricesActive, true);
  if (!priced.pricesActive) return;
  assert.equal(priced.lines.find((line) => line.id === "basis")?.amountExcl, 360);
  assert.equal(priced.lines.find((line) => line.id === "kleur.buiten")?.amountExcl, 72);
  assert.equal(priced.lines.find((line) => line.id === "ventilatie.rooster")?.amountExcl, 150);
  assert.equal(priced.totalExcl, 582);
  assert.equal(priced.totalIncl, 704.22);
  assert.equal(priced.lines.some((line) => line.id === "marge"), false);
});

test("new Fillout options stay out of the price until a purchase amount exists", () => {
  const layout = getLayoutBySlug("draaikiepraam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  config.vent = "duco";
  config.spacer = "zwart";
  config.bars = "met";
  config.handleColor = "zwart";
  config.frameOut = "ral";
  config.ralCode = "RAL 7016";
  const ids = optionIdsFor({ ...config, hasSash: true });
  for (const id of ["ventilatie.duco", "afstandhouder.zwart", "roeden.met", "kruk.kleur", "kleur.ral"]) {
    assert.equal(ids.includes(id), true, id);
  }
  assert.equal(ids.includes("ventilatie.rooster"), false);
  assert.equal(ids.includes("kleur.buiten"), false);
  const priced = calculatePrice(
    {
      layout: layout.slug,
      widthMm: config.width,
      heightMm: config.height,
      panes: layout.panes,
      optionIds: ids,
    },
    priceBook,
    true,
  );
  assert.equal(priced.pricesActive, false);
  const text = summaryText(config);
  assert.match(text, /Duco-klep/);
  assert.match(text, /zwart, warm edge/);
  assert.match(text, /met roede, contact per mail/);
  assert.match(text, /RAL naar keuze, op aanvraag \(RAL 7016\)/);
  assert.equal(text.includes("€"), false);
  const again = parseConfig(new URLSearchParams(serializeConfig(config)), layout);
  assert.equal(again.vent, "duco");
  assert.equal(again.spacer, "zwart");
  assert.equal(again.bars, "met");
  assert.equal(again.handleColor, "zwart");
  assert.equal(again.ralCode, "RAL 7016");
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

  const banned = /\bEKO\b|eko4u|eko-nl|\bRC2\b|\bPKVW\b|\bKOMO\b|\bSKG\b|hefschuif|brievenbus|bovenlicht|\bvoordeur\b|Politiekeurmerk|1,80|marginPercent|V-Super|\bHFL\b|75\.67|22\.97|66\.27|38\.54|14\.52|67\.64|139\.81|111\.61|967\.83|283\.77|43\.02|34\.31|50\.78|61\.49|211\.01/i;
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
