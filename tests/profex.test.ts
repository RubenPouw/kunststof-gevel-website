import assert from "node:assert/strict";
import test from "node:test";

import { getBrandStory } from "../src/data/seo/brands.ts";
import { pricePerSquareMetre } from "../src/lib/catalog/square-metre.ts";
import { staticBrands, staticProducts } from "../src/lib/catalog/static.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { isBannedSampleProduct, isBannedSampleText } from "../src/lib/staal/banned.ts";

const profex = staticProducts.filter((product) => product.brandSlug === "profex");

function bySlug(slug: string) {
  const product = profex.find((item) => item.slug === slug);
  assert.ok(product, slug);
  return product;
}

test("Profex is a brand again and Duafort and Canexel stay banned", () => {
  assert.equal(isBannedSampleText("Profex Dubbel Rabat"), false);
  assert.equal(isBannedSampleText("Duafort rabat"), true);
  assert.equal(isBannedSampleText("Canexel vervanger"), true);
  assert.equal(isBannedSampleProduct({ brandSlug: "profex", name: "Profex Velling 165 mm" }), false);
  assert.equal(staticBrands.some((brand) => brand.slug === "profex"), true);
  assert.equal(profex.some((product) => /duafort|canexel/i.test(product.name)), false);
  assert.equal(profex.some((product) => product.slug === "profex-duafort-rabat-125"), false);
  assert.equal(profex.some((product) => product.slug === "afdichtingsprofiel-pvc-45"), false);
});

test("Profex length prices and square metre prices match the approved list", () => {
  const rabat = bySlug("profex-dubbel-rabat-300");
  assert.equal(rabat.workingWidthMm, 270);
  assert.equal(rabat.variants.every((variant) => variant.length === "6 m" && variant.price === 96.79), true);
  assert.equal(pricePerSquareMetre({ priceIncl: 96.79, workingWidthMm: 270, length: "6 m" }), 59.75);

  const potdeksel = bySlug("profex-potdeksel-198");
  assert.equal(potdeksel.workingWidthMm, 168);
  const potdekselPrices = Object.fromEntries(potdeksel.variants.map((variant) => [variant.colorName, variant.price]));
  assert.equal(potdekselPrices.Wit, 60.35);
  assert.equal(potdekselPrices.Zwart, 90.84);
  assert.equal(potdeksel.variants.every((variant) => variant.length === "6 m"), true);

  const velling = bySlug("profex-velling-165");
  assert.equal(velling.workingWidthMm, 135);
  assert.equal(velling.variants.every((variant) => variant.length === "6 m" && variant.price === 48.4), true);
  assert.equal(pricePerSquareMetre({ priceIncl: 48.4, workingWidthMm: 135, length: "6 m" }), 59.75);

  assert.equal(bySlug("profex-boeideel-310").price, 180);
  assert.equal(bySlug("profex-startprofiel-3m").price, 9.95);
  assert.equal(bySlug("profex-ventilatieprofiel-3m").price, 9.95);
  assert.equal(bySlug("profex-hoekprofiel-2-delig-3m").price, 12.95);
  assert.equal(bySlug("profex-verbindingsprofiel-2-delig-3m").price, 12.95);
  assert.equal(bySlug("profex-buitenhoek-300").price, 11.96);
  assert.equal(bySlug("profex-verbinding-300").price, 10.96);
  assert.equal(bySlug("profex-stootvoeg-dubbel-rabat").price, 7.95);
  assert.equal(bySlug("profex-stootvoeg-velling").price, 6.95);
  assert.equal(bySlug("profex-velling-165").profileType, "velling");
  assert.equal(bySlug("profex-stootvoeg-velling").profileType, "profiel");
  assert.equal(bySlug("profex-potdeksel-198").profileType, "potdeksel");
  assert.equal(bySlug("profex-dubbel-rabat-300").profileType, "rabat");
  assert.equal(bySlug("profex-boeideel-310").profileType, "dakrand");
  assert.equal(bySlug("profex-stootvoeg-potdeksel").price, 6.95);
});

test("the Profex page names the profiles, the USPs and a one-hop canonical", () => {
  const story = getBrandStory("profex");
  assert.ok(story);
  assert.equal(story.heading, "Profex kunststof gevelbekleding");
  assert.equal(story.metaTitle, "Profex kunststof gevelbekleding | kunststof-gevel.nl");
  assert.ok(story.metaTitle.length <= 60, story.metaTitle);
  assert.match(story.description, /nooit meer schilderen/i);
  assert.match(story.description, /max\. 3 werkdagen/);
  assert.deepEqual(
    story.profiles?.map((tile) => tile.label),
    ["Velling", "Dubbel rabat", "Potdeksel", "Boeideel"],
  );
  const text = [story.lead, story.description, ...story.sections.flatMap((section) => [section.heading, ...section.paragraphs]), ...story.faqs.flatMap((faq) => [faq.q, faq.a])].join("\n");
  assert.equal(text.includes("\u2014") || text.includes("\u2013"), false);
  assert.doesNotMatch(text, /\beko\b|duafort|canexel/i);
  assert.match(text, /Montage door Cavemen/);
  assert.ok(story.links.some((link) => link.href === "/gevelbekleding"));
  assert.ok(story.links.some((link) => link.href === "/montage"));

  for (const path of [
    "/profex-gevelbekleding",
    "/merk/profex",
    "/product/profex-duafort-hoekprofiel-2-delig",
    "/product/profex-ventilatieprofiel",
    "/product/duafort-rabat-125-mm-canexel-vervanger",
  ]) {
    const row = lookupRedirect(path);
    assert.equal(row.to, "/merken/profex", path);
    assert.equal(lookupRedirect("/merken/profex").status, "200");
  }
});
