#!/usr/bin/env node
/**
 * Checks every old path in data/seo/redirects.json.
 * Same-URL rows must be 200. Every other row must be one 301 whose Location
 * returns 200. Product pages that only exist in the Shopify catalog are
 * confirmed against the live preview when the local catalog does not have them.
 *
 *   CHECK_BASE=http://127.0.0.1:43147 node scripts/check-redirects.mjs
 */
import { readFileSync } from "node:fs";

const base = process.env.CHECK_BASE;
const rows = JSON.parse(readFileSync(new URL("../data/seo/redirects.json", import.meta.url), "utf8"));
const handles = new Set(JSON.parse(readFileSync(new URL("../data/seo/catalog-handles.json", import.meta.url), "utf8")));
const liveOrigin = process.env.LIVE_CATALOG_ORIGIN || "https://kunststofgevel-website.onrender.com";

if (!base) {
  console.error("Set CHECK_BASE to the running site, for example http://127.0.0.1:43147");
  process.exit(1);
}

async function statusOf(url) {
  const response = await fetch(url, { redirect: "manual" });
  return { status: response.status, location: response.headers.get("location") };
}

let failed = 0;
const targets = new Map();

for (const row of rows) {
  const url = new URL(row.from, base);
  const response = await statusOf(url);
  if (row.status === "200") {
    if (response.status !== 200) {
      failed += 1;
      console.error(`expected 200 ${row.from} got ${response.status}`);
    }
    continue;
  }
  if (response.status !== 301 && response.status !== 308) {
    failed += 1;
    console.error(`expected 301 ${row.from} got ${response.status}`);
    continue;
  }
  const location = response.location ? new URL(response.location, base) : null;
  const expected = new URL(row.to, base);
  if (!location || location.pathname !== expected.pathname || location.search !== expected.search) {
    failed += 1;
    console.error(`location ${row.from} -> ${location?.pathname}${location?.search} expected ${row.to}`);
    continue;
  }
  if (location.host !== url.host) {
    failed += 1;
    console.error(`host changed on ${row.from}`);
  }
  targets.set(`${location.pathname}${location.search}`, location);
}

const pending = [...targets.values()];
let index = 0;
async function worker() {
  while (index < pending.length) {
    const location = pending[index];
    index += 1;
    const local = await statusOf(location);
    if (local.status === 200) continue;
    const handle = location.pathname.startsWith("/producten/") ? location.pathname.split("/")[2] : "";
    if (handle && handles.has(handle)) {
      const live = await statusOf(new URL(location.pathname, liveOrigin));
      if (live.status === 200) continue;
    }
    failed += 1;
    console.error(`target not 200 ${location.pathname}${location.search} local ${local.status}`);
  }
}
await Promise.all(Array.from({ length: 6 }, () => worker()));

console.log(`checked ${rows.length} old paths, ${targets.size} targets, failures ${failed}`);
if (failed) process.exit(1);
