import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { Sql } from "../src/lib/db/client.ts";
import { GOOGLE_REVIEW_STAT } from "../src/lib/reviews/config.ts";
import { googleRowExpired, googleScoreLabel } from "../src/lib/reviews/format.ts";
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
});

test("company schema does not mark up review scores", () => {
  const schema = readFileSync(new URL("../src/lib/seo/schema.ts", import.meta.url), "utf8");
  const pages = readFileSync(new URL("../src/app/reviews/page.tsx", import.meta.url), "utf8");
  assert.equal(schema.includes("AggregateRating"), false);
  assert.equal(schema.includes("Review"), false);
  assert.equal(pages.includes("AggregateRating"), false);
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
