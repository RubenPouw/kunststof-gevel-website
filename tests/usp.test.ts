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
  assert.match(line(uspBySection.kozijnen), /Ontwerp in 3D in de configurator/);
  assert.match(line(uspBySection.kozijnen), /Meerdere kozijnen in één offertemand/);
  assert.match(line(uspBySection.kozijnen), /Duidelijke meetinstructie/);
});

test("kozijn copy does not sell installation, stock or a colour guarantee", () => {
  const article = getArticle("montage");
  assert.ok(article);
  const montage = JSON.stringify(article);
  assert.match(montage, /leveren/);
  assert.match(montage, /monteren niet/);
  assert.equal(/Montage via offerte|aparte offerte|Montage door ons|met de montage mee/i.test(montage), false);

  const measure = hubCopy.faqs.find((item) => item.q === "Meten jullie in?");
  assert.ok(measure);
  assert.match(measure.a, /leveren/);
  assert.match(measure.a, /monteren kozijnen niet/);
  assert.equal(/opname|aparte offerte/i.test(measure.a), false);

  const extra = STEPS.find((step) => step.id === "extra");
  assert.ok(extra);
  assert.equal(/Montage vraagt u apart/i.test(extra.hint), false);
  assert.match(extra.hint, /leveren/);
  assert.equal(extra.article, "montage");

  const place = articles.flatMap((item) => item.faqs).find((item) => item.q === "Plaatsen jullie ook?");
  assert.ok(place);
  assert.match(place.a, /^Nee\./);
  assert.equal(/offerte/i.test(place.a), false);

  const blob = [
    JSON.stringify(hubCopy),
    JSON.stringify(articles),
    readFileSync(new URL("../src/app/kunststof-kozijnen/kennisbank/page.tsx", import.meta.url), "utf8"),
  ].join("\n");
  assert.equal(/uit voorraad|kleurgarantie|garantie op kleur|10 jaar garantie/i.test(blob), false);
  assert.equal(/\d+\s*(werk)?dag/i.test(blob), false);
});
