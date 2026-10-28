import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { blogPosts } from "../src/data/blog/posts.ts";
import { projects } from "../src/data/projects.ts";
import { landingMatches, landingSlugs } from "../src/data/seo/landings.ts";
import { articles } from "../src/lib/kozijnen/kennis.ts";
import { allLayouts, GROUPS, layoutPath } from "../src/lib/kozijnen/layouts.ts";
import { lookupRedirect, resolveNavigation } from "../src/lib/seo/redirects.ts";
import brands from "../src/data/catalog/brands.json" with { type: "json" };
import handles from "../data/seo/catalog-handles.json" with { type: "json" };
import duplicatePublicSlugs from "../data/seo/duplicate-public-slugs.json" with { type: "json" };

const STATIC = new Set([
  "/",
  "/gevelbekleding",
  "/hpl-platen",
  "/hpl-plaat",
  "/dakranden",
  "/kozijnafwerking",
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

test("landing pages keep the products that belong on that slug", () => {
  assert.equal(
    landingMatches("keralit-gevelbekleding", {
      brandSlug: "keralit",
      category: "gevelbekleding",
      profileType: "sponning",
      name: "Keralit sponning",
    }),
    true,
  );
  assert.equal(
    landingMatches("keralit-gevelbekleding", {
      brandSlug: "keralit",
      category: "dakranden",
      profileType: "dakrand",
      name: "Keralit dakrand",
    }),
    false,
  );
  assert.equal(
    landingMatches("zierer-steenstrips", {
      brandSlug: "zierer",
      category: "montage",
      profileType: "profiel",
      name: "Zierer startprofiel",
    }),
    true,
  );
  assert.equal(
    landingMatches("kunststof-vensterbank", {
      brandSlug: "milinboard",
      category: "kozijnafwerking",
      profileType: "vensterbank",
      name: "Overzetvensterbank",
    }),
    true,
  );
});

test("every old URL in the redirect map reaches a 200 in one hop", () => {
  const csv = readFileSync(new URL("../docs/redirectkaart.csv", import.meta.url), "utf8");
  const table = parseCsv(csv.trim());
  const [header, ...rows] = table;
  assert.deepEqual(header, ["oude_url", "prioriteit", "status", "zoektermen", "nieuwe_url"]);
  assert.equal(rows.length, 260);

  const home = rows.filter((row) => row[4] === "/").map((row) => row[0]);
  assert.deepEqual(home.sort(), ["/", "/kunststof-gevelbekleding/"]);

  for (const [oude, , , , nieuwe] of rows) {
    assert.ok(nieuwe, `empty nieuwe_url ${oude}`);
    const path = oude === "/" ? "/" : oude.replace(/\/$/, "");
    const row = lookupRedirect(path);
    assert.equal(row.to, nieuwe, oude);

    const decision = resolveNavigation({
      host: "kunststof-gevel.nl",
      pathname: oude,
      search: "",
    });
    assert.equal(decision.action, "redirect", oude);
    if (decision.action !== "redirect") continue;
    assert.equal(decision.host, "www.kunststof-gevel.nl", oude);
    const target = `${decision.pathname}${decision.search}`;
    assert.equal(target, nieuwe, oude);

    const finalPath = nieuwe.split("?")[0] || "/";
    const again = lookupRedirect(finalPath);
    assert.equal(again.status, "200", `second hop ${oude} -> ${finalPath}`);
    assert.equal(again.to.split("?")[0], finalPath, `chain ${oude}`);
    assert.equal(served(finalPath), true, `no page for ${oude} -> ${finalPath}`);

    const www = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: finalPath,
      search: nieuwe.includes("?") ? `?${nieuwe.split("?")[1]}` : "",
    });
    assert.equal(www.action, "next", `final still redirects ${finalPath}`);
  }
});

test("the three ranking slugs are 200 and the decided redirects stay one hop", () => {
  assert.equal(lookupRedirect("/keralit-gevelbekleding").status, "200");
  assert.equal(lookupRedirect("/zierer-steenstrips").to, "/zierer-steenstrips");
  assert.equal(lookupRedirect("/kunststof-vensterbank").to, "/kunststof-vensterbank");
  assert.equal(lookupRedirect("/kunststof-gevelbekleding").to, "/");
  assert.equal(lookupRedirect("/vinyplus-gevelbekleding").to, "/merken/vinyplus");

  const slash = resolveNavigation({
    host: "kunststofgevel-website-pr13.onrender.com",
    pathname: "/keralit-gevelbekleding/",
    search: "",
  });
  assert.equal(slash.action, "redirect");
  if (slash.action !== "redirect") return;
  assert.equal(slash.pathname, "/keralit-gevelbekleding");
  assert.equal(slash.host, null);

  const apex = resolveNavigation({
    host: "kunststof-gevel.nl",
    pathname: "/vinyplus-gevelbekleding/",
    search: "",
  });
  assert.equal(apex.action, "redirect");
  if (apex.action !== "redirect") return;
  assert.equal(apex.host, "www.kunststof-gevel.nl");
  assert.equal(apex.pathname, "/merken/vinyplus");
});
