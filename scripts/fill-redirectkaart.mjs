/**
 * Fills docs/redirectkaart.csv from the live sitemap paths plus the nine
 * indexable URLs that Rank Math leaves out of the sitemap.
 * Run: node --experimental-strip-types --import ./tests/register.mjs scripts/fill-redirectkaart.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { lookupRedirect } from "../src/lib/seo/redirects.ts";

const sitemapDir = "/tmp/sitemaps";
const files = [
  "page.xml",
  "post.xml",
  "product.xml",
  "category.xml",
  "product_brand.xml",
  "product_cat.xml",
  "local.xml",
];

function locs(name) {
  const xml = readFileSync(`${sitemapDir}/${name}`, "utf8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    const path = url.pathname.replace(/\/$/, "") || "/";
    return path;
  });
}

const paths = [];
const seen = new Set();
function add(path) {
  if (seen.has(path)) return;
  seen.add(path);
  paths.push(path);
}
for (const file of files) for (const path of locs(file)) add(path);

const extras = [
  "/keralit-gevelbekleding",
  "/zierer-steenstrips",
  "/vinyplus-gevelbekleding",
  "/kunststof-gevelbekleding",
  "/shop",
  "/product-categorie/kunststof-gevelbekleding",
  "/product-categorie/kunststof-dakranden-boei-delen",
  "/product-categorie/kozijn-afwerking-vensterbanken",
  "/product-categorie/kunststof-dakranden-boei-delen/keralit-dakranden",
];
for (const path of extras) add(path);

const live301 = new Set([
  "/keralit-gevelbekleding",
  "/zierer-steenstrips",
  "/vinyplus-gevelbekleding",
  "/kunststof-gevelbekleding",
]);

const terms = {
  "/keralit-gevelbekleding": "positie 9, volume 4.8K",
  "/zierer-steenstrips": "positie 1",
  "/kunststof-vensterbank": "vensterbank, positie 7 en 8",
  "/kunststof-gevelbekleding": "kunststof gevelbekleding, homepage",
};

const priority = {
  "/keralit-gevelbekleding": "P1",
  "/zierer-steenstrips": "P1",
  "/kunststof-vensterbank": "P1",
  "/kunststof-gevelbekleding": "P1",
};

function cell(value) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

const lines = ["oude_url,prioriteit,status,zoektermen,nieuwe_url"];
for (const path of paths) {
  const row = lookupRedirect(path);
  const oude = path === "/" ? "/" : `${path}/`;
  lines.push(
    [oude, priority[path] ?? "", live301.has(path) ? "301" : "200", terms[path] ?? "", row.to]
      .map(cell)
      .join(","),
  );
}

writeFileSync(new URL("../docs/redirectkaart.csv", import.meta.url), `${lines.join("\n")}\n`);
console.log(`wrote ${paths.length} rows`);
