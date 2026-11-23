import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { officialBrandLogo } from "../src/lib/catalog/brand-logos.ts";

const HOME_BRANDS = ["milin", "novicell", "heering", "milinboard", "vinyplus", "vinytherm", "keralit", "eurotexx"];

function readLogo(src: string) {
  return readFileSync(new URL(`../public${src}`, import.meta.url), "utf8");
}

test("homepage brands resolve to an official svg, not a navy wordmark", () => {
  for (const slug of HOME_BRANDS) {
    const src = officialBrandLogo(slug);
    assert.ok(src?.endsWith(".svg"), slug);
    const svg = readLogo(src!);
    assert.doesNotMatch(svg, /#1B2838/i, slug);
    assert.doesNotMatch(svg, /<script/i, slug);
  }
});

test("florence and unipanel use the manufacturer file, not the site wordmark", () => {
  for (const slug of ["florence", "unipanel"]) {
    const src = officialBrandLogo(slug);
    assert.equal(src, `/merken/${slug}.svg`);
    assert.doesNotMatch(readLogo(src!), /#1B2838/i);
  }
});

test("brands without an official mark keep their title", () => {
  for (const slug of ["werzalit", "hpl", "hpl-compact-exterieur", "hpl-fr", "overig", "profex", "abet", "linerio", "wonderboard"]) {
    assert.equal(officialBrandLogo(slug), undefined, slug);
  }
});
