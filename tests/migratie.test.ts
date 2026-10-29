import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { isIndexableDestination, KERALIT_CANONICAL } from "../src/lib/seo/migratie.ts";
import { lookupRedirect, normalizePath, resolveNavigation } from "../src/lib/seo/redirects.ts";

const APP = new URL("../src/app/", import.meta.url);

function routePatterns(dir = APP, prefix: string[] = []): string[][] {
  const out: string[][] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir.pathname, name);
    if (!statSync(full).isDirectory()) {
      if (name === "page.tsx") out.push(prefix);
      continue;
    }
    if (name.startsWith("_")) continue;
    out.push(...routePatterns(new URL(`${name}/`, dir), [...prefix, name]));
  }
  return out;
}

const ROUTES = routePatterns();

function hasPage(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  function walk(index: number, candidates: string[][]): boolean {
    if (index === parts.length) return candidates.some((route) => route.length === index);
    const exact = candidates.filter((route) => route[index] === parts[index]);
    const dynamic = candidates.filter(
      (route) => route[index]?.startsWith("[") && !route[index].startsWith("[...") && !route[index].startsWith("[["),
    );
    const rest = candidates.filter((route) => route[index]?.startsWith("[...") || route[index]?.startsWith("[[..."));
    if (exact.length && walk(index + 1, exact)) return true;
    if (dynamic.length && walk(index + 1, dynamic)) return true;
    return rest.length > 0;
  }
  return walk(0, ROUTES);
}

function csvUrls(text: string) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split(",")[0].replace(/^"|"$/g, ""));
}

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

test("every migration URL lands on a real indexable page in one hop", () => {
  const urls = csvUrls(readFileSync(new URL("../docs/seo-basis/migratie-urls.csv", import.meta.url), "utf8"));
  assert.equal(urls.length, 487);
  const failures: string[] = [];
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const landed = settle(pathname);
    const from = normalizePath(pathname);
    if (landed.hops > 1) failures.push(`${pathname} hops ${landed.hops}`);
    if (landed.search) failures.push(`${pathname} keeps ${landed.search}`);
    if (landed.path === "/") {
      if (from !== "/" && from !== "/kunststof-gevelbekleding") failures.push(`${pathname} -> /`);
      continue;
    }
    if (!isIndexableDestination(landed.path, landed.search)) failures.push(`${pathname} -> ${landed.path} noindex`);
    if (!hasPage(landed.path)) failures.push(`${pathname} -> ${landed.path} missing page`);
  }
  assert.deepEqual(failures, []);
});
