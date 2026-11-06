import assert from "node:assert/strict";
import test from "node:test";

import { categoryPageSeo, categoryPath, categoryRedirectTarget } from "../src/data/seo/category-pages.ts";
import { categoryMetadata, categoryViewMetadata } from "../src/data/seo/categories.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { absoluteUrl, breadcrumbJsonLd, collectionPageJsonLd } from "../src/lib/seo/schema.ts";

test("category slug, title, h1 and description live in one file", () => {
  const seo = categoryPageSeo.vensterbanken;
  assert.equal(seo.slug, "vensterbanken");
  assert.equal(categoryPath("vensterbanken"), "/vensterbanken");
  assert.equal(seo.h1, "Vensterbanken");
  const meta = categoryMetadata("vensterbanken");
  assert.equal(meta.title, seo.title);
  assert.equal(meta.description, seo.description);
  assert.equal(meta.alternates && "canonical" in meta.alternates ? meta.alternates.canonical : "", "/vensterbanken");
  const page2 = categoryViewMetadata("vensterbanken", {}, 2, 3);
  assert.equal(page2.alternates && "canonical" in page2.alternates ? page2.alternates.canonical : "", "/vensterbanken?pagina=2");
  assert.equal(lookupRedirect("/vensterbanken").status, "200");
  for (const page of Object.values(categoryPageSeo)) {
    assert.equal(lookupRedirect(`/${page.slug}`).status, "200", page.id);
  }
});

test("a replaced category slug 301s once to the current slug", () => {
  const pages = [
    {
      id: "vensterbanken" as const,
      slug: "vensterbanken",
      previousSlugs: ["oude-vensterbank"],
    },
  ];
  assert.equal(categoryRedirectTarget("/oude-vensterbank", pages), "/vensterbanken");
  assert.equal(categoryRedirectTarget("/vensterbanken", pages), null);
  const moved = [
    {
      id: "vensterbanken" as const,
      slug: "nieuwe-vensterbanken",
      previousSlugs: ["vensterbanken"],
    },
  ];
  assert.equal(categoryRedirectTarget("/vensterbanken", moved), "/nieuwe-vensterbanken");
  assert.equal(categoryRedirectTarget("/nieuwe-vensterbanken", moved), null);
});

test("a category page emits breadcrumb and collection schema", () => {
  const crumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Vensterbanken", path: "/vensterbanken" },
  ]);
  assert.equal(crumb["@type"], "BreadcrumbList");
  assert.equal(crumb.itemListElement.length, 2);
  assert.equal(crumb.itemListElement[1]?.item, absoluteUrl("/vensterbanken"));
  const collection = collectionPageJsonLd({
    name: categoryPageSeo.vensterbanken.h1,
    description: categoryPageSeo.vensterbanken.description,
    path: categoryPath("vensterbanken"),
  });
  assert.equal(collection["@type"], "CollectionPage");
  assert.equal(collection.url, absoluteUrl("/vensterbanken"));
});
