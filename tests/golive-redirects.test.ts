import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import sitemap from "../src/app/sitemap.ts";
import { blogPosts } from "../src/data/blog/posts.ts";
import brands from "../src/data/catalog/brands.json" with { type: "json" };
import productsJson from "../src/data/catalog/products.json" with { type: "json" };
import { projects } from "../src/data/projects.ts";
import { brandStories } from "../src/data/seo/brands.ts";
import { landingSlugs } from "../src/data/seo/landings.ts";
import { isHiddenOnKunststofGevel } from "../src/lib/catalog/visibility.ts";
import { articles } from "../src/lib/kozijnen/kennis.ts";
import { allLayouts, GROUPS, layoutPath } from "../src/lib/kozijnen/layouts.ts";
import { lookupRedirect, normalizePath, resolveNavigation } from "../src/lib/seo/redirects.ts";
import handles from "../data/seo/catalog-handles.json" with { type: "json" };
import duplicatePublicSlugs from "../data/seo/duplicate-public-slugs.json" with { type: "json" };

type GoliveRow = { oud: string; nieuw: string; type: "200" | "301" | "308" };

const STATIC = new Set([
  "/",
  "/gevelbekleding",
  "/hpl-platen",
  "/hpl-plaat",
  "/dakranden",
  "/boeidelen",
  "/boeidelen/keralit",
  "/boeidelen/vinyplus",
  "/boeidelen/milexx",
  "/plafondpanelen/badkamer",
  "/plafondpanelen/overstek",
  "/rabatdelen",
  "/plafondpanelen",
  "/kozijnafwerking",
  "/vensterbanken",
  "/montage",
  "/kunststof-kozijnen",
  "/merken",
  "/stalen",
  "/staalaanvraag",
  "/offerte",
  "/contact",
  "/zakelijk",
  "/projecten",
  "/reviews",
  "/over-ons",
  "/blog",
  "/privacy",
  "/algemene-voorwaarden",
  "/herroepingsrecht",
  "/verzenden-retour",
  "/klachtenprocedure",
  "/keralit-gevelbekleding",
  "/zierer-steenstrips",
  "/kunststof-vensterbank",
  "/kunststof-kozijnen/kennisbank",
  "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier",
  "/kunststof-kozijnen/offertemand",
]);

for (const brand of brands as { slug: string }[]) STATIC.add(`/merken/${brand.slug}`);
for (const post of blogPosts) STATIC.add(`/blog/${post.slug}`);
for (const project of projects) STATIC.add(`/projecten/${project.slug}`);
for (const group of GROUPS) STATIC.add(group.href);
for (const layout of allLayouts()) STATIC.add(layoutPath(layout));
for (const article of articles) STATIC.add(`/kunststof-kozijnen/kennisbank/${article.slug}`);
for (const slug of landingSlugs) STATIC.add(`/${slug}`);

const productSlugs = new Set<string>(handles as string[]);
for (const clean of Object.values(duplicatePublicSlugs as Record<string, string>)) productSlugs.add(clean);
for (const item of (productsJson as { items: { slug: string }[] }).items) productSlugs.add(item.slug);

function served(pathname: string) {
  if (STATIC.has(pathname)) return true;
  if (pathname.startsWith("/producten/")) return productSlugs.has(pathname.slice("/producten/".length));
  return false;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function loadMap(): GoliveRow[] {
  const csv = readFileSync(new URL("../data/seo/golive-redirects.csv", import.meta.url), "utf8");
  const [header, ...rows] = parseCsv(csv.trim());
  assert.deepEqual(header, ["oud", "nieuw", "type", "fallback_zonder_pr65"]);
  return rows.map((cells) => ({
    oud: cells[0],
    nieuw: cells[1],
    type: cells[2] as GoliveRow["type"],
  }));
}

function splitOud(oud: string) {
  const index = oud.indexOf("?");
  if (index === -1) return { pathname: oud, search: "" };
  return { pathname: oud.slice(0, index), search: `?${oud.slice(index + 1)}` };
}

/** Product pages 404 until the Profex articles are in Shopify or Postgres. */
function liveDestination(nieuw: string) {
  if (nieuw.startsWith("/producten/profex-")) return "/merken/profex";
  return nieuw;
}

test("the approved go-live map is one hop onto a real page", () => {
  const map = loadMap();
  assert.equal(map.length, 319);
  const counts = { "200": 0, "301": 0, "308": 0, query: 0 };
  const missing: string[] = [];
  const chains: string[] = [];

  for (const row of map) {
    counts[row.type] += 1;
    const source = splitOud(row.oud);
    if (source.search) counts.query += 1;

    const expected = liveDestination(row.nieuw);
    const found = lookupRedirect(source.pathname, source.search);
    assert.equal(found.status, row.type, row.oud);
    assert.equal(found.to, expected, row.oud);

    const decision = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: source.pathname,
      search: source.search,
    });
    const landed =
      decision.action === "next"
        ? `${normalizePath(source.pathname)}${source.search}`
        : `${decision.pathname}${decision.search}`;
    assert.equal(landed, expected, row.oud);

    const destination = expected.split("?")[0] || "/";
    const again = lookupRedirect(destination, expected.includes("?") ? `?${expected.split("?")[1]}` : "");
    if (again.status !== "200" || again.to.split("?")[0] !== destination) {
      chains.push(`${row.oud} -> ${expected} -> ${again.to}`);
    }
    if (!served(destination)) missing.push(`${row.oud} -> ${expected}`);

    const settled = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: destination,
      search: expected.includes("?") ? `?${expected.split("?")[1]}` : "",
    });
    assert.equal(settled.action, "next", `${row.oud} still moves after ${expected}`);
  }

  assert.equal(counts["301"], 307);
  assert.equal(counts["200"], 11);
  assert.equal(counts["308"], 1);
  assert.equal(counts.query, 47);
  assert.deepEqual(chains, []);
  assert.deepEqual(missing, []);
});

test("query attributes pick the product and other parameters fall away", () => {
  const plain = lookupRedirect(
    "/product/novaboard-kunststof-vensterbank/",
    "?kleur=antraciet&lengte=2600",
  );
  assert.equal(plain.status, "301");
  assert.equal(plain.to, "/kunststof-vensterbank");

  const depth = lookupRedirect(
    "/product/novaboard-kunststof-vensterbank",
    "?attribute_pa_diepte-vensterbank=250-mm&kleur=wit&lengte=2000",
  );
  assert.equal(depth.to, "/producten/novaboard-vensterbank-250mm");

  const decision = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/product/milexx-volschuim-platpaneel/",
    search: "?attribute_pa_afmeting-platpaneel=150-x-9-mm&gclid=abcdefghij",
  });
  assert.equal(decision.action, "redirect");
  if (decision.action !== "redirect") return;
  assert.equal(decision.pathname, "/producten/volschuim-platpaneel-150x9-mm");
  assert.equal(decision.search, "?gclid=abcdefghij");

  const wrong = lookupRedirect(
    "/product/unipanel-bouwpaneel",
    "?attribute_pa_maten-unipanel=geen-maat",
  );
  assert.equal(wrong.to, "/merken/unipanel");
});

test("a trailing slash on a live page is only the slash hop", () => {
  const decision = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/keralit-gevelbekleding/",
    search: "",
  });
  assert.equal(decision.action, "redirect");
  if (decision.action !== "redirect") return;
  assert.equal(decision.pathname, "/keralit-gevelbekleding");
  assert.equal(lookupRedirect("/keralit-gevelbekleding").status, "200");
  assert.equal(lookupRedirect("/dakkapel-renovatie").status, "308");
});

test("wonderboard and linerio stay out of the sitemap and the product listing", async () => {
  const banned = /linerio|wonderboard/i;
  for (const path of [
    "/merken/wonderboard",
    "/merken/linerio/",
    "/product/wonderboard-plafondtegel",
    "/product-categorie/linerio",
    "/producten/linerio-wandpaneel-s-115mm",
    "/producten/wonderboard-2500x1200x2-3-mm-structuur-1",
  ]) {
    const row = lookupRedirect(path);
    assert.equal(row.status, "301", path);
    assert.equal(row.to, "/gevelbekleding", path);
    assert.equal(lookupRedirect("/gevelbekleding").status, "200");
  }

  const items = (productsJson as { items: { slug?: string; name?: string; description?: string; brand?: string; brandSlug?: string }[] }).items;
  const listing = items.filter((item) => !isHiddenOnKunststofGevel(item));
  assert.equal(listing.some((item) => banned.test(`${item.slug} ${item.name} ${item.description} ${item.brand} ${item.brandSlug}`)), false);
  assert.equal((brands as { slug: string; name: string }[]).some((brand) => banned.test(`${brand.slug} ${brand.name}`)), false);
  assert.equal(brandStories.some((story) => banned.test(JSON.stringify(story))), false);
  assert.equal(blogPosts.some((post) => banned.test(JSON.stringify(post))), false);

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url).join("\n");
  assert.equal(banned.test(urls), false);
});
