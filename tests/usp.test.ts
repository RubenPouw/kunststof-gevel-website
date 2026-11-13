import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { hubCopy } from "../src/lib/kozijnen/content.ts";
import { articles, getArticle } from "../src/lib/kozijnen/kennis.ts";
import { STEPS } from "../src/lib/kozijnen/model.ts";
import { isKozijnSection, uspBySection, uspForPath } from "../src/lib/usp.ts";

const KOZIJN_PATHS = [
  "/kunststof-kozijnen",
  "/kunststof-kozijnen/",
  "/kunststof-kozijnen/ramen",
  "/kunststof-kozijnen/ramen/draaikiepraam",
  "/kunststof-kozijnen/schuifpuien/schuifpui-2-delig",
  "/kunststof-kozijnen/deuren/tuindeur",
  "/kunststof-kozijnen/kennisbank",
  "/kunststof-kozijnen/kennisbank/montage",
  "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier",
  "/ramen/draaikiepraam",
  "/schuifpuien/schuifpui-2-delig",
  "/deuren/tuindeur",
  "/kennisbank/montage",
  "/kozijnen",
];

function line(items: readonly { k: string; v: string }[]) {
  return items.map((item) => `${item.k} ${item.v}`).join(" | ");
}

test("kozijn routes get the kozijn bar, the rest keep montage and colour guarantee", () => {
  for (const path of KOZIJN_PATHS) {
    assert.equal(isKozijnSection(path), true, path);
    const text = line(uspForPath(path));
    assert.equal(text, line(uspBySection.kozijnen));
    assert.equal(/montage/i.test(text), false, text);
    assert.equal(/garantie/i.test(text), false, text);
    assert.equal(/voorraad/i.test(text), false, text);
  }
  assert.match(line(uspForPath("/gevelbekleding")), /10 jaar garantie op kleur/);
  assert.match(line(uspForPath("/gevelbekleding")), /Montage via offerte/);
  assert.equal(line(uspForPath("/")), line(uspBySection.site));
  assert.equal(line(uspForPath("/offerte")), line(uspBySection.site));
  assert.match(line(uspBySection.kozijnen), /Aluplast kozijnen op maat/);
  assert.match(line(uspBySection.kozijnen), /Werktekening met maten/);
  assert.match(line(uspBySection.kozijnen), /Meerdere kozijnen in één offertemand/);
  assert.match(line(uspBySection.kozijnen), /Duidelijke meetinstructie/);
});

test("kozijn copy offers Cavemen montage without promising a survey or removal", () => {
  const article = getArticle("montage");
  assert.ok(article);
  assert.equal(article.title, "Kozijnen plaatsen: zelf of door Cavemen");
  assert.match(article.description, /Vraag een offerte aan\.$/);
  const montage = JSON.stringify(article);
  assert.match(montage, /Montage door Cavemen/);
  assert.match(montage, /U meet zelf/);
  assert.match(montage, /geen standaardbelofte/);
  assert.equal(/monteren niet|plaatsen het niet|nemen het oude kozijn niet mee|wij komen inmeten/i.test(montage), false);

  const measure = hubCopy.faqs.find((item) => item.q === "Meten jullie in?");
  assert.ok(measure);
  assert.match(measure.a, /U meet zelf/);
  assert.match(measure.a, /Montage door Cavemen/);
  assert.equal(/monteren kozijnen niet|opname/i.test(measure.a), false);

  const extra = STEPS.find((step) => step.id === "extra");
  assert.ok(extra);
  assert.equal(/Montage vraagt u apart/i.test(extra.hint), false);
  assert.match(extra.hint, /leveren/);
  assert.match(extra.hint, /Cavemen/);
  assert.equal(extra.article, "montage");

  const place = articles.flatMap((item) => item.faqs).find((item) => item.q === "Plaatsen jullie ook?");
  assert.ok(place);
  assert.match(place.a, /^Ja, montage door Cavemen/);
  assert.match(place.a, /offerte/);

  const blob = [
    JSON.stringify(hubCopy),
    JSON.stringify(articles),
    readFileSync(new URL("../src/app/kunststof-kozijnen/kennisbank/page.tsx", import.meta.url), "utf8"),
  ].join("\n");
  assert.equal(/uit voorraad|kleurgarantie|garantie op kleur|10 jaar garantie/i.test(blob), false);
  assert.equal(/\d+\s*(werk)?dag/i.test(blob), false);
});
