import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMontageQuoteDraft,
  montageQuoteHref,
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

test("de offerte neemt m², prijs en winkelwagenregels mee", () => {
  assert.equal(draft.areaM2, "31,0");
  assert.match(draft.message, /€ 1\.425,38 incl\. btw voor 31,0 m²/);
  assert.match(draft.message, /Keralit sponningdeel 143mm, Zwart classic nerf, 28141260, 6\.000 mm, aantal 35/);
  assert.match(draft.message, /Materiaalsubtotaal: € 783,00 incl\. btw/);
  assert.equal(draft.message.includes("—"), false);
  assert.equal(draft.message.includes("Caveman"), false);
});

test("een korte toelichting past in de url, een lange blijft in de sessie", () => {
  const href = montageQuoteHref(draft);
  assert.match(href, /^\/offerte-montage\?/);
  assert.match(href, /montage=ja/);
  assert.match(href, /m2=31/);
  const fromUrl = readMontageQuoteRequest(href.slice(href.indexOf("?")), null);
  assert.equal(fromUrl?.areaM2, "31,0");
  assert.match(fromUrl?.message ?? "", /aantal 35/);

  const long = { ...draft, message: "regel\n".repeat(400) };
  const shortHref = montageQuoteHref(long);
  assert.equal(shortHref.includes("notitie="), false);
  const fromStore = readMontageQuoteRequest(shortHref.slice(shortHref.indexOf("?")), JSON.stringify(long));
  assert.equal(fromStore?.message, long.message);
  assert.equal(fromStore?.montageIncl, 1425.38);
});
