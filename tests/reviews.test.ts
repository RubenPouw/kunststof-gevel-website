import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { Sql } from "../src/lib/db/client.ts";
import { GOOGLE_REVIEW_STAT } from "../src/lib/reviews/config.ts";
import { googleReviewHref, googleReviewScoreText, googleRowExpired, googleScoreLabel, webwinkelkeurFootnote } from "../src/lib/reviews/format.ts";
import {
  mapGoogleReview,
  mapWebwinkelkeurRating,
  mapWebwinkelkeurSummary,
  webhookHash,
  webhookHashMatches,
} from "../src/lib/reviews/map.ts";
import { syncGoogle, syncWebwinkelkeur } from "../src/lib/reviews/sync.ts";
import { applyReviewWebhook } from "../src/lib/reviews/sync.ts";

const published = {
  id: 11,
  name: "J. Doe",
  email: "john.doe@example.com",
  order_number: "order-1",
  rating: 4,
  comment: "Strakke gevel, snel geleverd.",
  date: "2016-02-14",
  language: "nl",
  created: "2016-02-14 19:08:00",
  quarantine: false,
  verified: true,
  reaction: "Dank voor uw woorden.",
};

const low = {
  id: 12,
  name: "Piet",
  email: "piet@example.com",
  order_number: "order-9",
  rating: 1,
  comment: "De levertijd viel tegen.",
  date: "2016-03-01",
  language: "nl",
  created: "2016-03-01 10:00:00",
  quarantine: false,
  verified: false,
  reaction: "",
};

const held = {
  id: 13,
  name: "Jane Doe",
  email: "jane.doe@example.com",
  order_number: "order-2",
  rating: 2,
  comment: "Nog niet publiceren.",
  date: "2016-02-12",
  created: "2016-02-12 12:34:12",
  quarantine: true,
  verified: false,
  reaction: "",
};

function fakeSql(log: string[]) {
  const tag = (strings: TemplateStringsArray, ...values: unknown[]) => {
    log.push(`${strings.join(" ")} :: ${JSON.stringify(values)}`);
    return Promise.resolve([]);
  };
  return tag as unknown as Sql;
}

test("webwinkelkeur mapping keeps low scores and drops private fields", () => {
  const good = mapWebwinkelkeurRating(published);
  const poor = mapWebwinkelkeurRating(low);
  const hidden = mapWebwinkelkeurRating(held);
  assert.equal(hidden, null);
  assert.ok(good);
  assert.ok(poor);
  assert.equal(poor?.rating, 1);
  assert.equal(good?.replyText, "Dank voor uw woorden.");
  assert.equal(good?.verified, true);
  assert.equal(good?.createdAt, "2016-02-14T12:00:00.000Z");
  const stored = JSON.stringify([good, poor]);
  assert.equal(stored.includes("john.doe@example.com"), false);
  assert.equal(stored.includes("order-1"), false);
  assert.equal(stored.includes("jane.doe@example.com"), false);
  assert.equal(stored.includes("email"), false);
  assert.equal(stored.includes("order_number"), false);
});

test("summary uses the 10 point average and the full amount", () => {
  const summary = mapWebwinkelkeurSummary({
    status: "success",
    data: { amount: 144, rating_average: 9.81 },
  });
  assert.deepEqual(summary, { amount: 144, ratingAverage: 9.81 });
});

test("webhook hash matches the raw body and rejects a different secret", () => {
  const body = JSON.stringify({ id: 11, rating: 5 });
  const hash = webhookHash(body, "secret");
  assert.equal(webhookHashMatches(body, "secret", hash), true);
  assert.equal(webhookHashMatches(body, "secret", hash.toUpperCase()), true);
  assert.equal(webhookHashMatches(body, "other", hash), false);
  assert.equal(webhookHashMatches(`${body} `, "secret", hash), false);
});

test("google stars map onto 1 to 5 and a row older than 30 days expires", () => {
  const review = mapGoogleReview({
    reviewId: "abc",
    reviewer: { displayName: "Sam" },
    starRating: "FIVE",
    comment: "Netjes geplaatst.",
    createTime: "2026-01-02T10:00:00Z",
    reviewReply: { comment: "Fijn om te horen." },
  });
  assert.equal(review?.rating, 5);
  assert.equal(review?.source, "google");
  assert.equal(review?.replyText, "Fijn om te horen.");
  const now = new Date("2026-03-15T00:00:00Z");
  assert.equal(googleRowExpired(new Date("2026-01-01T00:00:00Z"), now), true);
  assert.equal(googleRowExpired(new Date("2026-03-01T00:00:00Z"), now), false);
});

test("the static Google line stays separate from WebwinkelKeur", () => {
  assert.equal(googleScoreLabel(GOOGLE_REVIEW_STAT.rating, GOOGLE_REVIEW_STAT.count), "Google 4,9 / 126 reviews");
  assert.equal(GOOGLE_REVIEW_STAT.href.includes("placeid=ChIJpTqzqNL_hy8RDIC8CeY0l9g"), true);
  assert.equal(GOOGLE_REVIEW_STAT.count, 126);
  assert.equal(googleReviewScoreText(), "4,9");
  assert.equal(googleReviewHref(), GOOGLE_REVIEW_STAT.href);
  assert.equal(
    webwinkelkeurFootnote(9.81, 144),
    "Ook beoordeeld op WebwinkelKeur: 9,8 / 10 (144 beoordelingen)",
  );
  assert.equal(webwinkelkeurFootnote(9.8, 144).includes("\u2014"), false);
});

test("company schema does not mark up review scores", () => {
  const schema = readFileSync(new URL("../src/lib/seo/schema.ts", import.meta.url), "utf8");
  const pages = readFileSync(new URL("../src/app/reviews/page.tsx", import.meta.url), "utf8");
  const strip = readFileSync(new URL("../src/components/reviews/score-strip.tsx", import.meta.url), "utf8");
  const line = readFileSync(new URL("../src/components/reviews/google-line.tsx", import.meta.url), "utf8");
  const product = readFileSync(new URL("../src/app/producten/[slug]/product-detail.tsx", import.meta.url), "utf8");
  assert.equal(schema.includes("AggregateRating"), false);
  assert.equal(schema.includes("Review"), false);
  assert.equal(pages.includes("AggregateRating"), false);
  assert.equal(strip.includes("AggregateRating"), false);
  assert.equal(line.includes("AggregateRating"), false);
  assert.equal(product.includes("AggregateRating"), false);
});

test("variant C shows Google from the static total and keeps WebwinkelKeur as a footnote", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const strip = read("../src/components/reviews/score-strip.tsx");
  const line = read("../src/components/reviews/google-line.tsx");
  const usp = read("../src/components/brand/usp-bar.tsx");
  const product = read("../src/app/producten/[slug]/product-detail.tsx");
  const category = read("../src/components/catalog/category-page.tsx");
  const cart = read("../src/app/winkelwagen/page.tsx");
  const checkout = read("../src/app/afrekenen/page.tsx");
  const footer = read("../src/components/site-footer.tsx");
  const home = read("../src/app/page.tsx");
  const reviews = read("../src/app/reviews/page.tsx");
  const pdp = read("../src/app/producten/[slug]/page.tsx");

  assert.match(strip, /Lees alle reviews/);
  assert.match(strip, /webwinkelkeurFootnote/);
  assert.match(strip, /tone="signal"/);
  assert.match(strip, /GOOGLE_REVIEW_STAT/);
  assert.match(strip, /w-full no-underline hover:no-underline sm:w-auto/);
  assert.equal(strip.includes("KeurmerkLink"), false);
  assert.equal(strip.includes("126"), false);
  assert.equal(strip.includes("4,9"), false);

  assert.match(line, /Google \{score\}/);
  assert.match(line, /GOOGLE_REVIEW_STAT\.count/);
  assert.match(line, /tone="signal"/);
  assert.equal(line.includes("126"), false);
  assert.equal(line.includes("4,9"), false);

  assert.match(usp, /GoogleReviewInline/);
  assert.equal(usp.includes("Google 4,9 / 5"), false);
  assert.equal(usp.includes("126"), false);

  const priceAt = product.indexOf("font-mono text-[32px]");
  const lineAt = product.indexOf("<GoogleReviewInline");
  const shipAt = product.indexOf("<ShippingEstimate");
  assert.ok(priceAt >= 0 && lineAt > priceAt && shipAt > lineAt);

  assert.ok(category.indexOf("<ReviewBar") < category.indexOf("<ProductListing"));
  for (const source of [home, reviews, pdp, cart, checkout]) {
    assert.match(source, /<ReviewBar/);
  }
  assert.match(footer, /<ReviewScoreStrip/);
});

test("sync stores ratings without email and skips quarantine", async () => {
  const previousKey = process.env.WEBWINKELKEUR_API_KEY;
  const previousId = process.env.WEBWINKELKEUR_SHOP_ID;
  process.env.WEBWINKELKEUR_API_KEY = "test-key";
  process.env.WEBWINKELKEUR_SHOP_ID = "1214873";
  const log: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("ratings_summary")) {
      return Response.json({ status: "success", data: { amount: 144, rating_average: 9.81 } });
    }
    return Response.json({
      status: "success",
      total: 3,
      ratings: [published, low, held],
    });
  };
  try {
    const result = await syncWebwinkelkeur({ fetch: fetchImpl, sql: fakeSql(log) });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.count, 2);
    const blob = log.join("\n");
    assert.equal(blob.includes("john.doe@example.com"), false);
    assert.equal(blob.includes("order-1"), false);
    assert.equal(blob.includes("order-9"), false);
    assert.equal(blob.includes("Nog niet publiceren"), false);
    assert.equal(blob.includes("Strakke gevel"), true);
    assert.equal(blob.includes("De levertijd viel tegen"), true);
    assert.equal(blob.includes("144"), true);
  } finally {
    if (previousKey === undefined) delete process.env.WEBWINKELKEUR_API_KEY;
    else process.env.WEBWINKELKEUR_API_KEY = previousKey;
    if (previousId === undefined) delete process.env.WEBWINKELKEUR_SHOP_ID;
    else process.env.WEBWINKELKEUR_SHOP_ID = previousId;
  }
});

test("google sync does nothing until the profile env is set", async () => {
  for (const key of [
    "GOOGLE_GBP_CLIENT_ID",
    "GOOGLE_GBP_CLIENT_SECRET",
    "GOOGLE_GBP_REFRESH_TOKEN",
    "GOOGLE_GBP_ACCOUNT_ID",
    "GOOGLE_GBP_LOCATION_ID",
  ]) {
    delete process.env[key];
  }
  let called = false;
  const result = await syncGoogle({
    fetch: async () => {
      called = true;
      return Response.json({});
    },
    sql: fakeSql([]),
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "config");
  assert.equal(called, false);
});

test("a quarantined webhook removes the review instead of publishing it", async () => {
  const log: string[] = [];
  const result = await applyReviewWebhook(fakeSql(log), "reviews.updated", held);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.action, "delete");
  assert.equal(log.join("\n").includes("jane.doe@example.com"), false);
  assert.match(log.join("\n"), /delete from reviews/);
});
