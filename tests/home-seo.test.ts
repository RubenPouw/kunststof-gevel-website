import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HomeHeroCopy } from "../src/components/home/home-hero-copy.tsx";
import { hero, homePageMetadata, homeTitle, site } from "../src/lib/site.ts";

const HOME_TITLE = "Kunststof gevelbekleding kopen | Kunststof-gevel.nl";
const HOME_H1 = "Kunststof gevelbekleding, dakranden en vensterbanken";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("homepage document title is absolute and does not pick up the site template", () => {
  assert.equal(homeTitle, HOME_TITLE);
  assert.equal(homeTitle.split("Kunststof-gevel.nl").length, 2);
  const layout = read("../src/app/layout.tsx");
  assert.match(layout, /template:\s*`%s · \$\{site\.name\}`/);

  const meta = homePageMetadata();
  assert.deepEqual(meta.title, { absolute: HOME_TITLE });
  assert.deepEqual(meta.openGraph?.title, { absolute: HOME_TITLE });
  assert.equal(Object.hasOwn(meta, "description"), false);
  assert.equal(meta.openGraph?.description, site.description);
  assert.equal(
    site.description,
    "Webshop van Pouw Online Group B.V. voor kunststof gevelbekleding, dakranden en kozijnen. Showroom op afspraak in Hedel.",
  );
  assert.match(read("../src/app/page.tsx"), /metadata:\s*Metadata\s*=\s*homePageMetadata\(\)/);
});

test("homepage hero has one h1 and keeps the slogan as a subtitle", () => {
  assert.equal(hero.heading, HOME_H1);
  assert.equal(hero.title, "Nooit meer schilderen.");
  assert.equal(hero.subtitle, "Vervang hout door kunststof.");

  const html = renderToStaticMarkup(createElement(HomeHeroCopy));
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  assert.equal(h1s.length, 1);
  const h1Text = (h1s[0]?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(h1Text, HOME_H1);
  assert.equal(h1Text.includes("Nooit meer schilderen"), false);

  const subtitle = html.match(/<p\b[^>]*>([\s\S]*?Nooit meer schilderen\.[\s\S]*?)<\/p>/);
  assert.ok(subtitle);
  const subtitleText = (subtitle?.[1] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal(subtitleText, "Nooit meer schilderen. Vervang hout door kunststof.");
  assert.match(subtitle?.[0] ?? "", /<span\b/);
  const headings = [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)];
  assert.equal(headings.some((match) => (match[1] ?? "").includes("Nooit meer schilderen")), false);

  const visible = [hero.heading, hero.title, hero.subtitle, hero.body].join("\n");
  assert.equal(visible.includes("—"), false);
  assert.equal(visible.includes("–"), false);
  assert.equal(html.includes("—"), false);
  assert.equal(html.includes("–"), false);

  const heroFile = read("../src/components/home/home-hero.tsx");
  assert.match(heroFile, /<HomeHeroCopy\s*\/>/);
  assert.equal(heroFile.includes("<h1"), false);

  const surfaces = [
    "../src/app/page.tsx",
    "../src/app/layout.tsx",
    "../src/components/site-header.tsx",
    "../src/components/site-footer.tsx",
    "../src/components/home/home-hero.tsx",
    "../src/components/home/assortment-grid.tsx",
    "../src/components/home/bestsellers.tsx",
    "../src/components/home/brand-marquee.tsx",
    "../src/components/home/business-band.tsx",
    "../src/components/home/faq-reviews.tsx",
    "../src/components/home/project-mosaic.tsx",
    "../src/components/home/samples-section.tsx",
    "../src/components/reviews/review-bar.tsx",
    "../src/components/reviews/home-quotes.tsx",
    "../src/components/seo/home-guides.tsx",
  ];
  for (const file of surfaces) {
    assert.equal(read(file).includes("<h1"), false, file);
  }
  assert.equal(read("../src/components/home/home-hero-copy.tsx").match(/<h1\b/g)?.length, 1);
});
