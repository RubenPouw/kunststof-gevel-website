import assert from "node:assert/strict";
import test from "node:test";

import { categoryPageSeo, categoryPath, categoryRedirectTarget } from "../src/data/seo/category-pages.ts";
import { categoryMetadata, categoryViewMetadata } from "../src/data/seo/categories.ts";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";
import { absoluteUrl, breadcrumbJsonLd, collectionPageJsonLd } from "../src/lib/seo/schema.ts";

test("category slug, title, h1 and description live in one file", () => {
  const seo = categoryPageSeo.vensterbanken;
  assert.equal(seo.slug, "kunststof-vensterbank");
  assert.equal(categoryPath("vensterbanken"), "/kunststof-vensterbank");
  assert.equal(seo.h1, "Kunststof vensterbank en overzet vensterbank (binnen en buiten)");
  const meta = categoryMetadata("vensterbanken");
  const title = meta.title;
  const titleText = typeof title === "string" ? title : title && typeof title === "object" && "absolute" in title ? title.absolute : "";
  assert.equal(titleText, seo.title);
  assert.equal(meta.description, seo.description);
  assert.equal(meta.alternates && "canonical" in meta.alternates ? meta.alternates.canonical : "", "/kunststof-vensterbank");
  const page2 = categoryViewMetadata("vensterbanken", {}, 2, 3);
  assert.equal(page2.alternates && "canonical" in page2.alternates ? page2.alternates.canonical : "", "/kunststof-vensterbank?pagina=2");
  assert.equal(lookupRedirect("/vensterbanken").to, "/kunststof-vensterbank");
  assert.equal(lookupRedirect("/vensterbanken").status, "301");
  assert.equal(lookupRedirect("/kunststof-vensterbank").status, "200");
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
    { name: "Vensterbanken", path: "/kunststof-vensterbank" },
  ]);
  assert.equal(crumb["@type"], "BreadcrumbList");
  assert.equal(crumb.itemListElement.length, 2);
  assert.equal(crumb.itemListElement[1]?.item, absoluteUrl("/kunststof-vensterbank"));
  const collection = collectionPageJsonLd({
    name: categoryPageSeo.vensterbanken.h1,
    description: categoryPageSeo.vensterbanken.description,
    path: categoryPath("vensterbanken"),
  });
  assert.equal(collection["@type"], "CollectionPage");
  assert.equal(collection.url, absoluteUrl("/kunststof-vensterbank"));
});

test("approved category and legacy redirects land in one hop", () => {
  const hops: [string, string][] = [
    ["/dakranden", "/boeidelen"],
    ["/kunststof-dakranden", "/boeidelen"],
    ["/keralit-dakranden", "/boeidelen/keralit"],
    ["/vinyplus-dakranden", "/boeidelen/vinyplus"],
    ["/milexx-dakranden", "/boeidelen/milexx"],
    ["/product/keralit-dakrand-eindprofiel-10-mm", "/boeidelen/keralit"],
    ["/hpl-platen", "/hpl-plaat"],
    ["/vensterbanken", "/kunststof-vensterbank"],
    ["/stalen", "/staalaanvraag"],
    ["/zakelijke-klanten", "/zakelijk"],
    ["/overstek-en-plafondpanelen", "/plafondpanelen/overstek"],
    ["/product-categorie/buitenplafonds", "/plafondpanelen/overstek"],
    ["/kunststof-binnenplafonds", "/plafondpanelen/badkamer"],
    ["/product-categorie/binnenplafonds", "/plafondpanelen/badkamer"],
    ["/kunststof-rabatdelen", "/rabatdelen"],
    ["/kozijnen", "/kunststof-kozijnen"],
  ];
  for (const [from, to] of hops) {
    const row = lookupRedirect(from);
    assert.equal(row.status, "301", from);
    assert.equal(row.to.split("?")[0], to, from);
    const again = lookupRedirect(to);
    assert.equal(again.status, "200", `${from} chains via ${to}`);
    assert.equal(again.to.split("?")[0], to, from);
  }
  assert.equal(lookupRedirect("/profex-gevelbekleding").to, "/merken/profex");
  assert.equal(categoryPageSeo.dakranden.title, "Kunststof boeidelen en dakranden kopen | Keralit, VinyPlus, Milexx");
  assert.equal(categoryPageSeo.dakranden.h1, "Kunststof boeidelen en dakranden");
  assert.equal(categoryPageSeo.gevelbekleding.h1, "Gevelbekleding");
  assert.equal(categoryPageSeo.kozijnafwerking.title, "Kozijnafwerking en dagkantafwerking van kunststof");
});
