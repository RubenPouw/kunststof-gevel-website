import assert from "node:assert/strict";
import test from "node:test";

import { getBlogPost } from "../src/data/blog/posts.ts";
import { faqPlainText } from "../src/lib/seo/schema.ts";

test("dakkapel renovatie post keeps the brief", () => {
  const post = getBlogPost("dakkapel-renovatie");
  assert.ok(post);
  if (!post) return;

  assert.equal(post.title, "Dakkapel renovatie met kunststof: aanpak en kosten");
  assert.equal(post.h1, "Dakkapel renovatie met kunststof: zo pak je het aan");
  assert.equal(post.date, "2026-11-20");
  assert.equal(post.image?.src, "/images/blog/dakkapel-rabat-2026-11-20.jpg");
  assert.equal(
    post.image?.alt,
    "Dakkapel gerenoveerd met witte kunststof rabatdelen en nieuwe witte kozijnen",
  );
  assert.doesNotMatch(post.image?.alt ?? "", /\d|\bRAL\b/);
  assert.equal(post.faqs.length, 7);
  assert.equal(post.cta?.heading, "Klaar om je dakkapel te renoveren?");
  assert.deepEqual(
    post.cta?.actions.map((action) => action.href),
    ["/keralit-gevelbekleding", "/boeidelen/keralit", "/offerte"],
  );
  assert.equal(post.cta?.more?.href, "/blog/wat-kost-kunststof-gevelbekleding");

  const text = JSON.stringify(post);
  assert.doesNotMatch(text, /—/);
  assert.doesNotMatch(text, /\b(Duafort|Profex|Canexel|Linerio|Wonderboard)\b/);
  assert.doesNotMatch(text, /\bRAL\b/);
  assert.doesNotMatch(text, /€/);
  assert.doesNotMatch(text, /kleurvast|vormvast|garantie op kleur/);
  assert.match(text, /geen prijs per m²/);
  assert.match(text, /per lengte van 6 m/);
  assert.match(text, /10 jaar garantie op het materiaal/);
  assert.match(text, /max\. 3 werkdagen/);
  assert.match(text, /\/rabatdelen/);
  assert.match(text, /\/blog\/keralit-boeideel-dakrand-afwerken/);
  assert.doesNotMatch(text, /montagehandleiding/i);

  const priced = post.faqs.find((faq) => faq.q.startsWith("Wat kost"));
  assert.equal(
    faqPlainText(priced?.a ?? ""),
    "Dat hangt af van de afmetingen en wat je vernieuwt. Onze Keralit-panelen en boeidelen verkopen we per lengte van 6 m. Reken uit hoeveel lengtes je nodig hebt (zie het rekenvoorbeeld hierboven) en bekijk de actuele prijzen in de Keralit-categorie. Anderen noemen 70 tot 80% van de prijs van een nieuwe dakkapel.",
  );
});
