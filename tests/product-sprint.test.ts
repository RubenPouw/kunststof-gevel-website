import assert from "node:assert/strict";
import test from "node:test";

import { getLandingStory } from "../src/data/seo/landings.ts";
import { boeiKeralitArticle, categoryPageSeo } from "../src/data/seo/category-pages.ts";
import {
  productQueryRobots,
  productSprints,
  SPRINT_DELIVERY,
  sprintForProduct,
  sprintSpecRows,
} from "../src/data/seo/product-sprint.ts";
import { staticProducts } from "../src/lib/catalog/static.ts";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd, productSchemaErrors } from "../src/lib/seo/schema.ts";
import type { Product } from "../src/lib/catalog/types.ts";

const BANNED = [/duafort/i, /profex/i, /canexel/i, /linerio/i, /wonderboard/i, /caveman(?!s)/i, /—/, /4 werkdagen/i, /5 werkdagen/i, /1 dagdeel/i];

function visible(story: (typeof productSprints)[number]) {
  return JSON.stringify({
    title: story.title,
    h1: story.h1,
    description: story.description,
    intro: story.intro,
    introBySlug: story.introBySlug,
    specs: story.specs.map((spec) => spec.value),
    needIntro: story.needIntro,
    need: story.need.map((link) => link.label),
    montage: story.montage,
    faqs: story.faqs,
    links: story.links.map((link) => link.label),
  });
}

test("each sprint product has one story, live delivery and sourced specs", () => {
  assert.equal(productSprints.length, 6);
  const slugs = productSprints.flatMap((story) => story.slugs);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const story of productSprints) {
    assert.equal(story.faqs.length >= 3 && story.faqs.length <= 5, true, story.id);
    assert.match(story.description, new RegExp(SPRINT_DELIVERY.replace(".", "\\.")));
    assert.equal(story.title.includes("—"), false);
    assert.equal(story.description.includes("—"), false);
    for (const spec of story.specs) assert.ok(spec.source.length > 12, `${story.id} ${spec.label}`);
    const text = visible(story);
    for (const banned of BANNED) assert.equal(banned.test(text), false, `${story.id} ${banned}`);
  }
  const bank = productSprints.find((story) => story.id === "overzet-380");
  assert.ok(bank);
  assert.equal(/buiten/i.test(visible(bank)), false);
});

test("sprint JSON-LD keeps the offer on the canonical URL and skips ratings", () => {
  const product = staticProducts.find((item) => item.slug === "keralit-sponning-143");
  assert.ok(product);
  const story = sprintForProduct(product);
  assert.ok(story);
  const data = productJsonLd(product, "Gevelbekleding", {
    name: story.h1,
    description: story.description,
    properties: sprintSpecRows(product, story),
  });
  assert.deepEqual(productSchemaErrors(data, `/producten/${product.slug}`), []);
  assert.equal("aggregateRating" in data, false);
  const crumbs = breadcrumbJsonLd([...story.crumbs, { name: story.h1, path: `/producten/${product.slug}` }]);
  assert.equal(crumbs["@type"], "BreadcrumbList");
  assert.equal(crumbs.itemListElement.length >= 3, true);
  const faq = faqJsonLd(story.faqs);
  assert.equal(faq?.["@type"], "FAQPage");
  assert.equal(faq?.mainEntity.length, story.faqs.length);
});

test("a priced product without a real review has an offer and no rating", () => {
  const base = staticProducts.find((item) => item.slug === "keralit-dakrand-paneel-250");
  assert.ok(base);
  const priced = {
    ...base,
    variants: base.variants.map((variant) => ({ ...variant, price: variant.price || 10 })),
    price: base.price || 10,
  } satisfies Product;
  const story = sprintForProduct(priced);
  assert.ok(story);
  const data = productJsonLd(priced, "Dakranden", { name: story.h1, description: story.description });
  assert.deepEqual(productSchemaErrors(data, `/producten/${priced.slug}`), []);
  const offers = data.offers as { url: string };
  assert.equal(offers.url.includes("?"), false);
  assert.equal(offers.url.endsWith(`/producten/${priced.slug}`), true);
});

test("color and filter query strings stay out of the product index", () => {
  assert.equal(productQueryRobots({}), undefined);
  assert.deepEqual(productQueryRobots({ attribute: "antraciet" }), { index: false, follow: true });
  assert.deepEqual(productQueryRobots({ kleur: "grijs" }), { index: false, follow: true });
  assert.match(categoryPageSeo.vensterbanken.description, /max\. 3 werkdagen/);
  assert.match(categoryPageSeo["hpl-platen"].description, /max\. 3 werkdagen/);
  assert.match(categoryPageSeo["hpl-platen"].description, /HPL plaat/);
  assert.equal(/4 werkdagen/.test(categoryPageSeo.vensterbanken.description), false);
  const bank = getLandingStory("kunststof-vensterbank");
  assert.ok(bank);
  assert.equal(/buiten/i.test(JSON.stringify(bank)), false);
  assert.match(JSON.stringify(bank), /max\. 3 werkdagen/);
  assert.match(boeiKeralitArticle.intro, /Keralit boeideel/);
  assert.match(JSON.stringify(boeiKeralitArticle), /max\. 3 werkdagen/);
});
