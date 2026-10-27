import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import { projectBrands, projectWordCount, projects } from "../src/data/projects.ts";
import { findProjectProduct, projectStaalHref } from "../src/lib/projects.ts";

test("project pages use the instagram set, without invented places or measures", () => {
  assert.equal(projects.length, 7);
  assert.deepEqual(
    projectBrands.map((brand) => brand.label),
    ["Keralit", "VinyPlus", "Kerrafront"],
  );
  const slugs = new Set(projects.map((project) => project.slug));
  assert.equal(slugs.size, projects.length);

  for (const project of projects) {
    const words = projectWordCount(project);
    assert.ok(words >= 150 && words <= 250, `${project.slug} has ${words} words`);
    const text = [project.title, project.card, ...project.paragraphs, ...project.photos.map((photo) => photo.alt)].join(
      "\n",
    );
    assert.equal(text.includes("\u2014") || text.includes("\u2013"), false, project.slug);
    assert.equal(/m²|m2|Bergen|Amersfoort|Deventer|Veluwe|Nunspeet/i.test(text), false, project.slug);
    assert.ok(project.photos.length > 0);
    for (const photo of project.photos) {
      assert.match(photo.src, /^\/projecten\/[a-z0-9-]+\.webp$/);
      assert.equal(existsSync(`public${photo.src}`), true, photo.src);
      assert.equal(existsSync(`public${photo.src.replace(/\.webp$/, ".avif")}`), true, photo.src);
      assert.ok(photo.alt.length > 20);
    }
  }

  const belgium = projects.filter((project) => /belgië/i.test(project.paragraphs.join(" ")));
  assert.deepEqual(
    belgium.map((project) => project.slug),
    ["keralit-190mm-plafond-overkapping"],
  );
});

test("a known panel preselects the sample wizard, an unknown line does not", () => {
  const quattro = projects.find((project) => project.slug === "vinyplus-quattro-uitbouw");
  const chalet = projects.find((project) => project.slug === "kerrafront-chalet");
  assert.ok(quattro && chalet);
  const quattroProduct = findProjectProduct(staticProducts, quattro.product);
  assert.match(quattroProduct?.slug ?? "", /quattro/);
  assert.match(projectStaalHref(quattroProduct), /^\/staalaanvraag\?groep=gevel&product=/);
  assert.equal(projectStaalHref(findProjectProduct(staticProducts, chalet.product)), "/staalaanvraag?groep=gevel");
});
