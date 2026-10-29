import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { lookupRedirect, redirectRows, resolveNavigation } from "../src/lib/seo/redirects.ts";
import duplicatePublicSlugs from "../data/seo/duplicate-public-slugs.json" with { type: "json" };

test("every crawled URL is a one-hop redirect or the same canonical URL", () => {
  const csv = readFileSync(new URL("../data/seo/redirects.csv", import.meta.url), "utf8");
  const lines = csv.trim().split("\n").slice(1);
  assert.equal(lines.length, redirectRows.length);

  const targets = new Map(redirectRows.map((row) => [row.from, row.to.split("?")[0]]));
  for (const row of redirectRows) {
    const found = lookupRedirect(row.from);
    assert.equal(found.to, row.to, row.from);
    assert.equal(found.status, row.status);
    const destination = row.to.split("?")[0];
    if (destination !== row.from && targets.has(destination)) {
      assert.equal(targets.get(destination), destination, `chain via ${row.from}`);
    }
    if (destination === "/") assert.ok(row.from === "/" || row.from === "/kunststof-gevelbekleding", row.from);
  }
});

test("trailing slash and apex host collapse in one redirect", () => {
  const decision = resolveNavigation({
    host: "kunststof-gevel.nl",
    pathname: "/webshop/",
    search: "",
  });
  assert.equal(decision.action, "redirect");
  if (decision.action !== "redirect") return;
  assert.equal(decision.pathname, "/gevelbekleding");
  assert.equal(decision.host, "www.kunststof-gevel.nl");
  assert.equal(decision.noindex, false);
});

test("preview host stays on that host and is noindex", () => {
  const decision = resolveNavigation({
    host: "kunststofgevel-website.onrender.com",
    pathname: "/contact",
    search: "",
  });
  assert.equal(decision.action, "next");
  if (decision.action !== "next") return;
  assert.equal(decision.noindex, true);
});

test("unknown old product paths fall back to a brand or category, not the homepage", () => {
  const decision = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/product/keralit-iets-nieuws/",
    search: "",
  });
  assert.equal(decision.action, "redirect");
  if (decision.action !== "redirect") return;
  assert.equal(decision.pathname, "/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding");
  assert.equal(decision.host, null);
});

test("active -1 product urls 301 to the clean slug", () => {
  const pairs = duplicatePublicSlugs as Record<string, string>;
  const targets = new Map(redirectRows.map((row) => [row.from, row.to.split("?")[0]]));
  for (const [duplicate, clean] of Object.entries(pairs)) {
    const from = `/producten/${duplicate}`;
    const to = `/producten/${clean}`;
    assert.equal(targets.get(from), to, from);
    assert.equal(targets.has(to), false, `${to} must stay a 200`);
    const decision = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: from,
      search: "",
    });
    assert.equal(decision.action, "redirect");
    if (decision.action !== "redirect") return;
    assert.equal(decision.pathname, to);
  }
  const kept = lookupRedirect("/producten/h-verbindingprofiel-4mm-1");
  assert.equal(kept.status, "200");
  assert.equal(kept.to, "/producten/h-verbindingprofiel-4mm-1");
});
