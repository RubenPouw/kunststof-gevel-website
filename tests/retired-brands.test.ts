import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getCatalog } from "../src/lib/catalog/index.ts";
import { staticBrands, staticProducts } from "../src/lib/catalog/static.ts";
import { lookupRedirect, redirectRows, resolveNavigation } from "../src/lib/seo/redirects.ts";
import sitemap from "../src/app/sitemap.ts";

const BANNED = /profex|duafort|canexel/i;
const root = fileURLToPath(new URL("..", import.meta.url));

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...filesUnder(path));
      continue;
    }
    if (/\.(tsx?|json|md|css|svg|html)$/.test(entry)) out.push(path);
  }
  return out;
}

function namesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    out.push(path);
    if (statSync(path).isDirectory()) out.push(...namesUnder(path));
  }
  return out;
}

test("pages and sitemap do not name Profex, Duafort or Canexel", async () => {
  const roots = [
    join(root, "src/app"),
    join(root, "src/components"),
    join(root, "src/data"),
    join(root, "src/lib/kozijnen"),
  ];
  const files = [
    ...roots.flatMap((dir) => filesUnder(dir)),
    join(root, "src/lib/site.ts"),
    join(root, "src/lib/usp.ts"),
  ];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), BANNED, file);
  }
  for (const path of [...namesUnder(join(root, "src")), ...namesUnder(join(root, "public"))]) {
    assert.doesNotMatch(path, BANNED, path);
  }

  assert.doesNotMatch(JSON.stringify(staticProducts), BANNED);
  assert.doesNotMatch(JSON.stringify(staticBrands), BANNED);

  const catalog = await getCatalog();
  assert.doesNotMatch(JSON.stringify(catalog.products), BANNED);
  assert.doesNotMatch(JSON.stringify(catalog.brands), BANNED);

  const entries = await sitemap();
  assert.ok(entries.length > 10);
  for (const entry of entries) {
    assert.doesNotMatch(entry.url, BANNED, entry.url);
  }
  assert.equal(entries.some((entry) => entry.url.endsWith("/merken/profex")), false);
});

test("old Profex, Duafort and Canexel URLs 301 once onto a live page", () => {
  const paths = new Set<string>([
    "/merken/profex",
    "/merken/profex/",
    "/merk/profex/",
    "/profex-gevelbekleding/",
    "/producten/profex-duafort-rabat-125",
    "/producten/afdichtingsprofiel-pvc-45",
    "/product/canexel-paneel/",
    "/product/duafort-velling-paneel-extra/",
    "/product-categorie/kunststof-gevelbekleding/canexel/",
  ]);
  for (const row of redirectRows) {
    assert.doesNotMatch(row.to, BANNED, row.from);
    if (BANNED.test(row.from)) paths.add(row.from);
  }

  for (const path of paths) {
    const row = lookupRedirect(path);
    assert.equal(row.status, "301", path);
    assert.doesNotMatch(row.to, BANNED, path);
    const destination = row.to.split("?")[0] || "/";
    const again = lookupRedirect(destination);
    assert.equal(again.status, "200", `${path} -> ${destination}`);
    assert.equal(again.to.split("?")[0], destination, `${path} chains`);
    assert.equal(existsSync(join(root, "src/app", destination.slice(1), "page.tsx")), true, destination);

    const decision = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: path,
      search: "",
    });
    assert.equal(decision.action, "redirect", path);
    if (decision.action !== "redirect") continue;
    assert.equal(decision.pathname, destination, path);
    assert.doesNotMatch(`${decision.pathname}${decision.search}`, BANNED, path);
    assert.equal(decision.host, null, path);

    const landed = resolveNavigation({
      host: "www.kunststof-gevel.nl",
      pathname: decision.pathname,
      search: decision.search,
    });
    assert.equal(landed.action, "next", `${path} second hop`);
  }
});

test("a retired brand filter is removed in the same redirect", () => {
  const mixed = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/gevelbekleding",
    search: "?merk=profex,keralit&gclid=abcdefghij",
  });
  assert.equal(mixed.action, "redirect");
  if (mixed.action !== "redirect") return;
  assert.equal(mixed.pathname, "/gevelbekleding");
  assert.equal(mixed.search, "?merk=keralit&gclid=abcdefghij");
  assert.doesNotMatch(mixed.search, BANNED);

  const only = resolveNavigation({
    host: "kunststof-gevel.nl",
    pathname: "/montage/",
    search: "?merk=Duafort",
  });
  assert.equal(only.action, "redirect");
  if (only.action !== "redirect") return;
  assert.equal(only.pathname, "/montage");
  assert.equal(only.search, "");
  assert.equal(only.host, "www.kunststof-gevel.nl");
  assert.equal(lookupRedirect("/montage").status, "200");
});
