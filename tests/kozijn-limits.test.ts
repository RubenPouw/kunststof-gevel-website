import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../src/app/api/kozijnen/prijs/route.ts";
import { priceKozijnOrder } from "../src/lib/kozijnen/checkout.ts";
import { allLayouts, getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { limitIntro } from "../src/lib/kozijnen/limits/check.ts";
import { defaultConfig, sizeInRange, sizeMessage } from "../src/lib/kozijnen/model.ts";
import { priceLayoutConfig } from "../src/lib/kozijnen/quote-price.ts";
import { resetKozijnRateLimit } from "../src/lib/kozijnen/rate-limit.ts";

const flags = {
  KOZIJNEN_PRIJZEN_ACTIEF: "true",
  KOZIJNEN_CHECKOUT_ACTIEF: "true",
};

test("each default size is inside the published limits", () => {
  for (const layout of allLayouts()) {
    assert.equal(sizeInRange(layout, layout.defaultWidth, layout.defaultHeight), true, layout.slug);
  }
});

test("a valid draaikiepraam is priced and a too-large one is refused", () => {
  const layout = getLayoutBySlug("draaikiepraam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  assert.equal(sizeInRange(layout, 1230, 1480), true);
  const priced = priceLayoutConfig(layout, config, true);
  assert.equal(priced.pricesActive, true);
  const order = priceKozijnOrder(layout.slug, "b=1000&h=1200", flags);
  assert.ok(order);

  assert.equal(sizeInRange(layout, 1231, 1200), false);
  assert.equal(sizeInRange(layout, 1000, 1481), false);
  const wide = priceLayoutConfig(layout, { ...config, width: 2000 }, true);
  assert.equal(wide.pricesActive, false);
  assert.equal(priceKozijnOrder(layout.slug, "b=2000&h=1200", flags), null);
  const message = sizeMessage(layout, 2000, 1200);
  assert.match(message, /Maximale breedte voor dit type is 1\.230 mm\. Neem contact op voor grotere maten\. Bel 030 227 1397\./);
  assert.equal(message.includes("—"), false);
  assert.equal(/eko/i.test(message), false);
  assert.match(sizeMessage(layout, 1000, 1600), /Maximale hoogte voor dit type is 1\.480 mm/);
});

test("a too-small size is refused when a minimum is set, and zero is always refused", () => {
  const layout = getLayoutBySlug("draaikiepraam");
  assert.ok(layout);
  assert.equal(sizeInRange(layout, 0, 1200), false);
  assert.equal(sizeInRange(layout, 1000, 0), false);
  assert.match(sizeMessage(layout, 0, 1200), /Vul een breedte en een hoogte/);
  const withMin = { ...layout, limits: { ...layout.limits, minWidth: 500, minHeight: 600 } };
  assert.equal(sizeInRange(withMin, 499, 800), false);
  assert.equal(sizeInRange(withMin, 500, 599), false);
  assert.equal(sizeInRange(withMin, 500, 600), true);
  assert.match(sizeMessage(withMin, 400, 800), /Minimale breedte voor dit type is 500 mm/);
  assert.match(sizeMessage(withMin, 800, 500), /Minimale hoogte voor dit type is 600 mm/);
});

test("fixed, compound, stolp and sliding limits follow the published edges", () => {
  const vast = getLayoutBySlug("vast-raam");
  const compound = getLayoutBySlug("vast-draaikiep-vast");
  const stolp = getLayoutBySlug("stolpraam");
  const two = getLayoutBySlug("schuifpui-2-delig");
  const four = getLayoutBySlug("schuifpui-4-delig");
  assert.ok(vast && compound && stolp && two && four);

  assert.equal(sizeInRange(vast, 1500, 1500), true);
  assert.equal(sizeInRange(vast, 1500, 1501), false);
  assert.equal(sizeInRange(compound, 1634, 2495), true);
  assert.equal(sizeInRange(compound, 1635, 1400), false);
  assert.equal(sizeInRange(stolp, 2092, 2495), true);
  assert.equal(sizeInRange(stolp, 2093, 1400), false);
  assert.equal(sizeInRange(two, 3100, 2400), true);
  assert.equal(sizeInRange(two, 3101, 2100), false);
  assert.equal(sizeInRange(two, 2000, 2401), false);
  assert.equal(sizeInRange(four, 6000, 2500), true);
  assert.equal(sizeInRange(four, 6001, 2100), false);
  assert.equal(sizeInRange(four, 4000, 2501), false);
  assert.match(sizeMessage(four, 6400, 2100), /Maximale breedte van een vak is 1\.500 mm/);
  assert.match(limitIntro(four.limits, four.panes), /6\.000 mm breed en 2\.500 mm hoog/);
});

test("the price api rejects a too-large frame and prices a valid one", async () => {
  resetKozijnRateLimit();
  const previous = process.env.KOZIJNEN_PRIJZEN_ACTIEF;
  process.env.KOZIJNEN_PRIJZEN_ACTIEF = "true";
  try {
    const tooLarge = await POST(
      new Request("http://local/api/kozijnen/prijs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.10" },
        body: JSON.stringify({ layout: "draaikiepraam", query: "b=2000&h=1200" }),
      }),
    );
    assert.equal(tooLarge.status, 400);
    const refused = (await tooLarge.json()) as { pricesActive: boolean; error?: string };
    assert.equal(refused.pricesActive, false);
    assert.match(refused.error ?? "", /1\.230 mm/);
    assert.equal(/eko/i.test(JSON.stringify(refused)), false);

    const valid = await POST(
      new Request("http://local/api/kozijnen/prijs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.11" },
        body: JSON.stringify({ layout: "draaikiepraam", query: "b=1000&h=1200" }),
      }),
    );
    assert.equal(valid.status, 200);
    const priced = (await valid.json()) as { pricesActive: boolean; totalExcl?: number };
    assert.equal(priced.pricesActive, true);
    assert.equal(typeof priced.totalExcl, "number");

    const tooSmall = await POST(
      new Request("http://local/api/kozijnen/prijs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.12" },
        body: JSON.stringify({ layout: "draaikiepraam", query: "b=0&h=1200" }),
      }),
    );
    assert.equal(tooSmall.status, 400);
  } finally {
    if (previous == null) delete process.env.KOZIJNEN_PRIJZEN_ACTIEF;
    else process.env.KOZIJNEN_PRIJZEN_ACTIEF = previous;
  }
});
