import assert from "node:assert/strict";
import test from "node:test";

import { isIndexableDestination, KERALIT_CANONICAL } from "../src/lib/seo/migratie.ts";
import { lookupRedirect, normalizePath, resolveNavigation } from "../src/lib/seo/redirects.ts";

function settle(pathname: string) {
  const first = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname,
    search: "",
  });
  if (first.action === "next") {
    return { hops: 0, path: normalizePath(pathname), search: "" };
  }
  const second = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: first.pathname,
    search: first.search,
  });
  assert.equal(second.action, "next", `${pathname} chains via ${first.pathname}`);
  return { hops: 1, path: first.pathname, search: first.search };
}

test("Keralit follows the live canonical: the product-category URL, not the short slug", () => {
  const liveCanonical = "/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding";
  assert.equal(KERALIT_CANONICAL, liveCanonical);

  const canonical = lookupRedirect(liveCanonical);
  assert.equal(canonical.status, "200");
  assert.equal(canonical.to, liveCanonical);

  for (const alias of ["/keralit-gevelbekleding", "/keralit-gevelbekleding/", "/merken/keralit", "/merk/keralit"]) {
    const landed = settle(alias);
    assert.equal(landed.hops, 1, alias);
    assert.equal(landed.path, liveCanonical, alias);
    assert.equal(isIndexableDestination(landed.path, landed.search), true, alias);
  }
});

test("ranking colour archives end on an indexable colour page in one hop", () => {
  const cases: Record<string, string> = {
    "/kleur-deel/antraciet-ral-7016/": "/gevelbekleding/kleuren/antraciet-ral-7016",
    "/kleur-deel/mosgroen-ral-6005/": "/gevelbekleding/kleuren/mosgroen-ral-6005",
    "/keralit-kleuren/antraciet-ral-7016/": "/merken/keralit/kleuren/antraciet-ral-7016",
    "/keralit-kleuren/mosgroen/": "/merken/keralit/kleuren/mosgroen",
  };
  for (const [from, expected] of Object.entries(cases)) {
    const landed = settle(from);
    assert.equal(landed.hops, 1, from);
    assert.equal(landed.path, expected, from);
    assert.equal(landed.search, "", from);
    assert.equal(isIndexableDestination(landed.path), true, from);
    assert.match(landed.path, /\/kleuren\//, from);
  }
});
