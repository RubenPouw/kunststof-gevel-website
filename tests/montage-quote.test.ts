import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMontageQuoteDraft,
  montageQuoteHref,
  montageQuoteShouldIndex,
  readMontageQuoteRequest,
} from "../src/lib/montage-quote.ts";

const draft = buildMontageQuoteDraft({
  areaM2: 31,
  montageIncl: 1425.38,
  materialIncl: 783,
  lines: [
    {
      name: "Keralit sponningdeel 143mm",
      color: "Zwart classic nerf",
      sku: "28141260",
      length: "6000",
      qty: 35,
    },
  ],
});

test("de offerte neemt titel, kleur, aantal, m² en prijs mee", () => {
  assert.equal(draft.areaM2, "31,0");
  assert.match(draft.message, /Keralit sponningdeel 143mm, Zwart classic nerf, 6\.000 mm, 35 stuks/);
  assert.match(draft.message, /Totaal: 31,0 m²/);
  assert.match(draft.message, /Indicatieve montageprijs: € 1\.425,38 incl\. btw/);
  assert.deepEqual(draft.parts, ["Gevel"]);
  assert.equal(draft.message.includes("—"), false);
});

test("dakrand en gevel worden apart gekozen, notities blijven uit de url", () => {
  const mixed = buildMontageQuoteDraft({
    areaM2: 12,
    montageIncl: 500,
    materialIncl: 800,
    lines: [
      { name: "VinyPlus dakrandpaneel", color: "Antraciet", sku: "VP", length: "", qty: 2, kind: "product" },
      { name: "Keralit sponningdeel", color: "Wit", sku: "KER", length: "", qty: 10, kind: "product" },
    ],
  });
  assert.deepEqual(mixed.parts, ["Dakrand", "Gevel"]);
  const href = montageQuoteHref(mixed);
  assert.equal(href.includes("notitie="), false);
  assert.match(href, /van=winkelwagen/);
  assert.match(href, /delen=Dakrand/);
  const fromStore = readMontageQuoteRequest(href.slice(href.indexOf("?")), JSON.stringify(mixed));
  assert.match(fromStore?.message ?? "", /2 stuks/);
  assert.match(fromStore?.message ?? "", /10 stuks/);
});

test("delen zonder m2 vult de chips, en die url blijft uit de index", () => {
  const draft = readMontageQuoteRequest("?delen=Gevel,Kozijnen", null);
  assert.deepEqual(draft?.parts, ["Gevel", "Kozijnen"]);
  assert.equal(draft?.areaM2, "");
  assert.equal(montageQuoteShouldIndex({}), true);
  assert.equal(montageQuoteShouldIndex({ delen: "Gevel,Kozijnen" }), false);
  assert.equal(montageQuoteShouldIndex({ m2: "12" }), false);
});
