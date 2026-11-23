import "./dom-setup.ts";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

import { GoogleReviewInline } from "../src/components/reviews/google-line.tsx";
import { ReviewsModal } from "../src/components/reviews/reviews-modal.tsx";
import { GOOGLE_REVIEW_STAT } from "../src/lib/reviews/config.ts";
import {
  isLongReview,
  readGoogleReviewCards,
  reviewDisplayName,
  REVIEW_TEXT_PREVIEW,
} from "../src/lib/reviews/cards.ts";
import { googleReviewHref } from "../src/lib/reviews/format.ts";

function read(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

async function render(node: ReturnType<typeof createElement>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(node);
  });
  return {
    host,
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
}

test("review names stay first name plus initial and incomplete rows are dropped", () => {
  assert.equal(reviewDisplayName("Jan Pietersen"), "Jan P.");
  assert.equal(reviewDisplayName("Jan P."), "Jan P.");
  assert.equal(reviewDisplayName("Sam"), "Sam");
  assert.equal(reviewDisplayName("  "), "");
  assert.equal(isLongReview("a".repeat(REVIEW_TEXT_PREVIEW)), false);
  assert.equal(isLongReview("a".repeat(REVIEW_TEXT_PREVIEW + 1)), true);
  const cards = readGoogleReviewCards({
    reviews: [
      { author: "Jan Pietersen", rating: 5, date: "2024-03-12", text: "Netjes geleverd." },
      { author: "", rating: 5, date: "2024-03-12", text: "Zonder naam." },
      { author: "Piet", rating: 5, date: "2024-03-12", text: "   " },
      { rating: 4, text: "Geen auteur." },
    ],
  });
  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.author, "Jan P.");
  assert.equal(readGoogleReviewCards({ reviews: [] }).length, 0);
  const stored = readGoogleReviewCards(JSON.parse(read("../src/data/reviews.json")));
  assert.deepEqual(
    stored.map((card) => card.author),
    ["Lia W.", "Niaaz B.", "Wim V.", "JESSICA S.", "Radha R."],
  );
});

test("the review badge is a button and does not link to Google", async () => {
  const line = read("../src/components/reviews/google-line.tsx");
  const strip = read("../src/components/reviews/score-strip.tsx");
  assert.match(line, /type="button"/);
  assert.equal(line.includes("googleReviewHref"), false);
  assert.equal(line.includes("search.google"), false);
  assert.equal(/<a[\s>]/.test(line), false);
  assert.equal(/<a[\s>]/.test(strip), false);
  assert.equal(strip.includes("search.google"), false);

  const view = await render(createElement(GoogleReviewInline));
  const button = view.host.querySelector("button");
  assert.ok(button);
  assert.equal(button?.getAttribute("href"), null);
  assert.equal(view.host.querySelector("a"), null);
  assert.equal(button?.getAttribute("type"), "button");
  assert.match(button?.textContent ?? "", /Google/);
  assert.match(button?.textContent ?? "", /reviews/);
  await view.unmount();
});

test("the modal opens and closes without leaving the page", async () => {
  const view = await render(createElement(GoogleReviewInline));
  const button = view.host.querySelector("button");
  assert.ok(button);
  assert.equal(document.querySelector("[data-reviews-modal]"), null);

  await act(async () => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await settle();
  const dialog = document.querySelector("[data-reviews-modal]");
  assert.ok(dialog);
  assert.equal(dialog?.getAttribute("role"), "dialog");
  assert.equal(dialog?.getAttribute("aria-modal"), "true");

  const closer = dialog?.querySelector("button[aria-label='Sluiten']");
  assert.ok(closer);
  await act(async () => {
    closer?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await settle();
  assert.equal(document.querySelector("[data-reviews-modal]"), null);
  await view.unmount();
});

test("escape and a click outside close the modal", async () => {
  const view = await render(createElement(GoogleReviewInline));
  const button = view.host.querySelector("button");
  await act(async () => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await settle();
  assert.ok(document.querySelector("[data-reviews-modal]"));

  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await settle();
  assert.equal(document.querySelector("[data-reviews-modal]"), null);

  await act(async () => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await settle();
  const backdrop = document.querySelector("[data-reviews-backdrop]");
  assert.ok(backdrop);
  await act(async () => {
    backdrop?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    backdrop?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    backdrop?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await settle();
  assert.equal(document.querySelector("[data-reviews-modal]"), null);
  await view.unmount();
});

test("without reviews the modal shows the score, the count and only the Google link", async () => {
  const view = await render(createElement(ReviewsModal, { onClose() {}, reviews: [] }));
  const dialog = document.querySelector("[data-reviews-modal]");
  assert.ok(dialog);
  assert.equal(dialog?.querySelector("li"), null);
  assert.match(dialog?.textContent ?? "", /reviews op Google/);
  assert.match(dialog?.textContent ?? "", /4,9/);
  assert.match(dialog?.textContent ?? "", /128/);
  const links = [...(dialog?.querySelectorAll("a") ?? [])];
  assert.equal(links.length, 1);
  const link = links[0];
  assert.equal(link?.getAttribute("href"), googleReviewHref());
  assert.equal(link?.getAttribute("href"), GOOGLE_REVIEW_STAT.href);
  assert.equal(link?.getAttribute("target"), "_blank");
  assert.match(link?.getAttribute("rel") ?? "", /noopener/);
  assert.match(link?.textContent ?? "", /Bekijk alle reviews op Google/);
  const badge = read("../src/components/reviews/google-line.tsx");
  assert.equal(badge.includes("AggregateRating"), false);
  assert.equal(read("../src/components/reviews/reviews-modal.tsx").includes("AggregateRating"), false);
  await view.unmount();
});
