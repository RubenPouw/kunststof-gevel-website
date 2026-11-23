import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { blogPosts, getBlogPost } from "../src/data/blog/posts.ts";
import { lookupRedirect, resolveNavigation } from "../src/lib/seo/redirects.ts";

const ADDED = [
  "keralit-kleuren",
  "steenlook-vensterbank",
  "kunststof-rabatdelen-monteren",
  "vensterbank-vervangen",
  "kunststof-gevelbekleding-kiezen",
  "kunststof-gevel-schoonmaken-onderhoud",
] as const;

const UNTOUCHED = [
  "dakkapel-renovatie",
  "wat-kost-kunststof-gevelbekleding",
  "keralit-of-vinyplus",
  "levensduur-kunststof-gevel",
  "montage-kunststof-gevelbekleding",
  "kleurstalen-aanvragen",
  "vinyplus-turners-eiken",
  "keralit-sponningdeel-167",
  "hpl-plaat",
  "condens-op-vensterbank",
  "overzet-vensterbank-meten",
  "rabat-horizontaal-of-verticaal",
  "vinyplus-quattro",
  "keralit-boeideel-dakrand-afwerken",
] as const;

test("the six missing WP posts are on the blog index and the old slugs stay", () => {
  for (const slug of ADDED) assert.ok(getBlogPost(slug), slug);
  for (const slug of UNTOUCHED) assert.ok(getBlogPost(slug), slug);
  assert.equal(blogPosts.length, ADDED.length + UNTOUCHED.length);
  const index = blogPosts.map((post) => post.slug);
  assert.ok(index.indexOf("steenlook-vensterbank") < index.indexOf("dakkapel-renovatie"));
});

test("new posts keep the house rules and local images", () => {
  for (const slug of ADDED) {
    const post = getBlogPost(slug);
    assert.ok(post, slug);
    if (!post) continue;
    const text = JSON.stringify(post);
    assert.doesNotMatch(text, /—|–/, slug);
    assert.doesNotMatch(text, /\b(Duafort|Profex|Canexel|Linerio|Wonderboard)\b/, slug);
    assert.doesNotMatch(text, /\/product\/|kunststof-gevel\.nl\//, slug);
    assert.doesNotMatch(text, /4 werkdagen/, slug);
    assert.match(text, /max\. 3 werkdagen/, slug);
    assert.equal(post.image?.src.startsWith("/images/blog/"), true, slug);
    assert.equal(existsSync(new URL(`../public${post.image?.src}`, import.meta.url)), true, post.image?.src);
    for (const section of post.sections) {
      if (!section.image) continue;
      assert.equal(existsSync(new URL(`../public${section.image.src}`, import.meta.url)), true, section.image.src);
    }
  }

  for (const slug of ["steenlook-vensterbank", "vensterbank-vervangen"] as const) {
    const text = JSON.stringify(getBlogPost(slug));
    assert.doesNotMatch(text, /buiten/i, slug);
    assert.match(text, /binnen/);
  }
});

test("WP permalinks of the new posts and the kosten article redirect in one hop", () => {
  const hops: Array<[string, string]> = [
    ["/steenlook-vensterbank/", "/blog/steenlook-vensterbank"],
    ["/keralit-kleuren", "/blog/keralit-kleuren"],
    ["/kunststof-rabatdelen-monteren/", "/blog/kunststof-rabatdelen-monteren"],
    ["/vensterbank-vervangen", "/blog/vensterbank-vervangen"],
    ["/kunststof-gevelbekleding-kiezen/", "/blog/kunststof-gevelbekleding-kiezen"],
    ["/kunststof-gevel-schoonmaken-onderhoud", "/blog/kunststof-gevel-schoonmaken-onderhoud"],
    ["/kosten-kunststof-gevelbekleding/", "/blog/wat-kost-kunststof-gevelbekleding"],
  ];
  for (const [from, to] of hops) {
    const row = lookupRedirect(from);
    assert.equal(row.status, "301", from);
    assert.equal(row.to, to, from);
    assert.equal(lookupRedirect(to).status, "200", to);
    const apex = resolveNavigation({ host: "kunststof-gevel.nl", pathname: from, search: "" });
    assert.equal(apex.action, "redirect", from);
    if (apex.action !== "redirect") continue;
    assert.equal(apex.pathname, to, from);
    assert.equal(apex.host, "www.kunststof-gevel.nl", from);
  }
});

test("older overview posts stay redirects and are not duplicated", () => {
  assert.equal(
    lookupRedirect("/kunststof-gevelbekleding-soorten-voordelen").to,
    "/gevelbekleding",
  );
  assert.equal(
    lookupRedirect("/kunststof-gevelbekleding-van-topkwaliteit-duurzaam-onderhoudsvrij-en-esthetisch").to,
    "/gevelbekleding",
  );
  assert.equal(
    lookupRedirect("/kunststof-gevelbekleding-in-houtlook-keralit-vinyplus-zijn-de-toppers").to,
    "/blog/keralit-of-vinyplus",
  );
  assert.equal(
    lookupRedirect("/alles-over-kunststof-gevelbekleding-voordelen-toepassingen-en-onderhoud").to,
    "/gevelbekleding",
  );
  assert.equal(getBlogPost("kunststof-gevelbekleding-soorten-voordelen"), undefined);
  assert.equal(getBlogPost("kosten-kunststof-gevelbekleding"), undefined);
});
