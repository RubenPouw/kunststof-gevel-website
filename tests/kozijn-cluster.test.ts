import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { clusterList, clusterPages } from "../src/data/seo/kozijn-cluster.ts";
import { footerColumns, hero, homeGuides } from "../src/lib/site.ts";
import { quoteDeliveryLines, validateQuote } from "../src/lib/quote.ts";

const forbiddenInTitle = [
  "kunststof kozijnen",
  "kunststof gevelbekleding",
  "dagkant",
  "kunststof boeidelen",
  "keralit boeideel",
  "kozijnen vervangen",
  "gevelrenovatie",
];

test("cluster titles and meta follow the marketing review", () => {
  assert.equal(clusterList.length, 5);
  assert.equal(clusterPages["volgorde-kozijnen-en-gevel"].path, "/volgorde-kozijnen-en-gevel");
  for (const page of clusterList) {
    assert.equal(page.path, `/${page.slug}`);
    assert.ok([...page.title].length <= 60, `${page.slug} title ${[...page.title].length}`);
    const meta = [...page.description].length;
    assert.ok(meta >= 140 && meta <= 155, `${page.slug} meta ${meta}`);
    assert.equal(/voor vakmannen/i.test(page.description), false, page.slug);
    assert.equal(page.title.includes("·"), false);
    const head = `${page.title}\n${page.h1}`.toLowerCase();
    for (const term of forbiddenInTitle) {
      assert.equal(head.includes(term), false, `${page.slug} ${term}`);
    }
  }
  const pillar = clusterPages["gevel-en-kozijnen-renoveren"];
  assert.match(pillar.intro, /kunststof kozijnen en gevelbekleding/);
  assert.equal(pillar.title.toLowerCase().includes("kunststof kozijnen en gevelbekleding"), false);
  assert.equal(pillar.h1.toLowerCase().includes("kunststof kozijnen en gevelbekleding"), false);
  assert.equal(clusterPages["aansluiting-kozijn-gevel"].h1, "Aansluiting kozijn en gevelbekleding");
  assert.equal(clusterPages["kleur-kozijn-en-gevelbekleding"].h1, "Kleur kozijn en gevelbekleding");
  assert.equal(clusterPages["kleur-kozijn-en-gevelbekleding"].subtitle, "Dezelfde kleur, twee materialen.");
});

test("cluster copy keeps the house rules", () => {
  const blob = JSON.stringify(clusterList);
  assert.equal(blob.includes("—"), false);
  assert.equal(blob.includes("–"), false);
  assert.equal(/\bCaveman\b/.test(blob), false);
  assert.match(blob, /Cavemen/);
  for (const word of ["Duafort", "Profex", "Canexel", "Linerio", "Wonderboard", "Milin", "subsidie"]) {
    assert.equal(new RegExp(word, "i").test(blob), false, word);
  }
  assert.equal(/085[\s-]?4010650|06[\s-]?46011057/.test(blob), false);
  for (const page of clusterList) {
    const text = [page.intro, ...page.sections.flatMap((section) => section.paragraphs), ...page.faqs.map((faq) => faq.a)].join("\n");
    assert.equal(/vensterbank[^.]*buiten|buiten[^.]*vensterbank/i.test(text), false, page.slug);
  }
});

test("only the pillar is added to menu, footer and the homepage card", () => {
  const service = footerColumns.find((column) => column.title === "Service");
  assert.ok(service);
  const hrefs = service.links.map((link) => link.href);
  assert.equal(hrefs.filter((href) => href === "/gevel-en-kozijnen-renoveren").length, 1);
  for (const slug of ["aansluiting-kozijn-gevel", "kleur-kozijn-en-gevelbekleding", "boeidelen-en-kozijnen", "volgorde-kozijnen-en-gevel"]) {
    assert.equal(hrefs.includes(`/${slug}`), false, slug);
  }
  const card = homeGuides.find((guide) => guide.href === "/gevel-en-kozijnen-renoveren");
  assert.ok(card);
  assert.equal(card.title, "kunststof kozijnen en gevelbekleding");
  assert.equal(homeGuides.filter((guide) => guide.href === "/gevel-en-kozijnen-renoveren").length, 1);
  assert.equal(hero.title, "Nooit meer schilderen.");
  const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.equal(/title:/.test(home), false);
});

test("montage mail carries colour, frame count and the removal question", () => {
  const base = {
    name: "Test Klant",
    email: "test@example.com",
    phone: "0302271397",
    city: "Utrecht",
    areaM2: "40",
    profile: "Nog niet zeker",
    message: "",
    wantsMontage: true,
    companyWebsite: "",
    parts: ["Gevel", "Kozijnen"],
    montageForm: true,
    colour: "Antraciet gevel",
    frameCount: "4",
    removal: "vraag",
  };
  assert.equal(validateQuote(base), null);
  assert.match(validateQuote({ ...base, frameCount: "" }) ?? "", /aantal kozijnen/);
  const lines = quoteDeliveryLines(base, { area: 40, reference: "KG-1", photoNames: [] });
  assert.equal(lines.some((line) => line === "Montage door Cavemen: ja"), true);
  assert.equal(lines.some((line) => line === "Kleur: Antraciet gevel"), true);
  assert.equal(lines.some((line) => line === "Aantal kozijnen: 4"), true);
  assert.equal(lines.some((line) => line === "Inmeten: klant meet zelf"), true);
  assert.match(lines.join("\n"), /Afvoer als vraag op de offerte/);
  const short = quoteDeliveryLines({ ...base, montageForm: false, parts: [] }, { area: 40, reference: "KG-2", photoNames: [] });
  assert.equal(short.some((line) => line.startsWith("Montage:")), true);
  assert.equal(short.some((line) => line.startsWith("Kleur:")), false);
});
