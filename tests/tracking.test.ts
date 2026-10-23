import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { defaultConfig } from "../src/lib/kozijnen/model.ts";
import { getLayoutBySlug } from "../src/lib/kozijnen/layouts.ts";
import { resolveNavigation } from "../src/lib/seo/redirects.ts";
import { buildClickConversion, formatAdsTime, resetAdsTokenCache, sendAdsConversion } from "../src/lib/tracking/ads.ts";
import { adsCheckoutAttributes } from "../src/lib/tracking/checkout-attrs.ts";
import { CLICK_CAPTURE_SCRIPT } from "../src/lib/tracking/capture-script.ts";
import { acceptClientEvent } from "../src/lib/tracking/client-event.ts";
import { adsFromCookies, consentGranted } from "../src/lib/tracking/consent.ts";
import { consentDecision, trackingCookieOptions } from "../src/lib/tracking/cookies.ts";
import { trackServerEvent } from "../src/lib/tracking/dispatch.ts";
import { isClientEvent, sanitizeParams } from "../src/lib/tracking/events.ts";
import { ga4Body } from "../src/lib/tracking/ga4.ts";
import { encodeAdsState, normalizeEmail, normalizePhone, sha256 } from "../src/lib/tracking/identity.ts";
import { handleOrderWebhook, parseOrderTracking } from "../src/lib/tracking/order.ts";
import { quoteTotalExcl } from "../src/lib/tracking/quote-value.ts";
import { trackOfferte, trackStaal } from "../src/lib/tracking/business.ts";

const CLIENT = "11111111-1111-4111-8111-111111111111";
const GCLID = "CjwKCAjw1234567890";
const offEnv = {
  TRACKING_GA4_ACTIEF: "false",
  TRACKING_ADS_ACTIEF: "false",
};

function cookie(granted = true) {
  const ads = encodeAdsState({ clientId: CLIENT, gclid: GCLID });
  return `kg_consent=${granted ? "granted" : "denied"}; kg_ads=${ads}`;
}

test("click ids stay first-party and GTM is gone", () => {
  assert.equal(CLICK_CAPTURE_SCRIPT.includes("googletagmanager"), false);
  assert.equal(CLICK_CAPTURE_SCRIPT.includes("http"), false);
  assert.match(CLICK_CAPTURE_SCRIPT, /kg-ads-pending/);
  const consent = readFileSync(new URL("../src/components/seo/consent.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  assert.equal(consent.includes("googletagmanager"), false);
  assert.equal(layout.includes("googletagmanager"), false);
  assert.match(consent, /geen script van Google/);
});

test("sanitize keeps the allowlist and blocks client conversion names", () => {
  assert.equal(isClientEvent("configurator_gestart"), true);
  assert.equal(isClientEvent("offertemand_verzonden"), false);
  assert.deepEqual(sanitizeParams("configurator_afgerond", { type: "draaikiepraam", waarde_excl: 10.239, geheim: 1 }), {
    type: "draaikiepraam",
    waarde_excl: 10.24,
  });
  assert.deepEqual(sanitizeParams("offertemand_verzonden", { aantal_kozijnen: 1, typen: "vast-raam", totaalwaarde: -5 }), {
    aantal_kozijnen: 1,
    typen: "vast-raam",
  });
});

test("email, phone and click state are normalised", () => {
  assert.equal(normalizeEmail("Jan.Jansen+tag@gmail.com"), "janjansen@gmail.com");
  assert.equal(normalizeEmail("Jan.Jansen@example.com"), "jan.jansen@example.com");
  assert.equal(normalizePhone("06 12345678"), "+31612345678");
  assert.equal(consentGranted(cookie(false)), false);
  assert.equal(adsFromCookies(cookie(false)), null);
  assert.equal(adsFromCookies("kg_ads=" + encodeAdsState({ clientId: CLIENT, gclid: GCLID })), null);
  const ads = adsFromCookies(cookie());
  assert.equal(ads?.clientId, CLIENT);
  assert.equal(ads?.gclid, GCLID);
});

test("consent cookie is set only for a real choice", () => {
  const options = trackingCookieOptions();
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, process.env.NODE_ENV === "production");
  const granted = consentDecision("granted", { clicks: { gclid: GCLID, gbraid: "te-kort" } });
  assert.equal(granted.consent, "granted");
  const decoded = JSON.parse(Buffer.from(granted.ads ?? "", "base64url").toString("utf8")) as {
    clientId: string;
    gclid?: string;
    gbraid?: string;
  };
  assert.equal(decoded.gclid, GCLID);
  assert.equal(decoded.gbraid, undefined);
  assert.match(decoded.clientId, /^[0-9a-f-]{36}$/i);
  assert.deepEqual(consentDecision("denied", {}), { consent: "denied", ads: null });
});

test("GA4 body and Ads payload stay on the public event", () => {
  const body = ga4Body(CLIENT, "configurator_gestart", { type: "draaikiepraam" });
  assert.equal(body.events[0]?.params.engagement_time_msec, 1);
  const when = new Date(Date.UTC(2026, 9, 22, 6, 14, 5));
  assert.equal(formatAdsTime(when), "2026-10-22 06:14:05+00:00");
  const env = {
    GOOGLE_ADS_CUSTOMER_ID: "123-456-7890",
    GOOGLE_ADS_CONVERSION_OFFERTE: "999",
  };
  const conversion = buildClickConversion({
    name: "offertemand_verzonden",
    params: { aantal_kozijnen: 1, typen: "vast-raam", totaalwaarde: 120 },
    clicks: { gclid: GCLID, gbraid: "GBRAID12345678" },
    email: "Jan.Jansen+tag@gmail.com",
    phone: "0612345678",
    env,
    now: when,
  });
  assert.equal(conversion?.gclid, GCLID);
  assert.equal("gbraid" in (conversion ?? {}), false);
  assert.equal(conversion?.conversionValue, 120);
  assert.equal(conversion?.userIdentifiers?.[0]?.hashedEmail, sha256("janjansen@gmail.com"));
  assert.equal(buildClickConversion({ name: "configurator_gestart", params: { type: "vast-raam" }, clicks: { gclid: GCLID }, env, now: when }), null);
  assert.equal(
    buildClickConversion({ name: "offertemand_verzonden", params: {}, clicks: {}, env, now: when }),
    null,
  );
});

test("flags off and missing consent do not call Google", async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response(null, { status: 204 });
  };
  const quiet = await trackServerEvent("offertemand_verzonden", { aantal_kozijnen: 1 }, { consent: true, gclid: GCLID }, offEnv, fetchImpl);
  assert.equal(quiet.forwarded, false);
  assert.equal(quiet.reason, "uit");
  const blocked = await trackServerEvent(
    "offertemand_verzonden",
    { aantal_kozijnen: 1 },
    { consent: false, gclid: GCLID },
    { TRACKING_GA4_ACTIEF: "true", GA4_MEASUREMENT_ID: "G-TEST", GA4_API_SECRET: "geheim" },
    fetchImpl,
  );
  assert.equal(blocked.reason, "geen-toestemming");
  assert.equal(calls, 0);
});

test("a granted offerte reaches GA4 and Ads, a configurator does not reach Ads", async () => {
  resetAdsTokenCache();
  const calls: { url: string; body: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const body = String(init?.body ?? "");
    calls.push({ url, body });
    if (url.includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
    }
    if (url.includes("uploadClickConversions")) {
      return new Response(JSON.stringify({ results: [{}] }), { status: 200 });
    }
    return new Response(null, { status: 204 });
  };
  const env = {
    TRACKING_GA4_ACTIEF: "true",
    GA4_MEASUREMENT_ID: "G-TEST",
    GA4_API_SECRET: "geheim",
    TRACKING_ADS_ACTIEF: "true",
    GOOGLE_ADS_DEVELOPER_TOKEN: "dev",
    GOOGLE_ADS_CUSTOMER_ID: "1234567890",
    GOOGLE_ADS_CLIENT_ID: "client",
    GOOGLE_ADS_CLIENT_SECRET: "secret",
    GOOGLE_ADS_REFRESH_TOKEN: "refresh",
    GOOGLE_ADS_CONVERSION_OFFERTE: "999",
    GOOGLE_ADS_CONVERSION_STAAL: "888",
  };
  const layout = getLayoutBySlug("vast-raam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  const request = new Request("https://kunststof-gevel.nl/api/kozijnen/offerte", { headers: { cookie: cookie() } });
  const sent = await trackOfferte(
    { request, config, email: "Jan.Jansen+tag@gmail.com", phone: "06 12345678", layout: layout.slug },
    { ...env, KOZIJNEN_PRIJZEN_ACTIEF: "false" },
    fetchImpl,
  );
  assert.equal(sent.forwarded, true);
  const ga = calls.find((call) => call.url.includes("google-analytics.com"));
  const ads = calls.find((call) => call.url.includes("uploadClickConversions"));
  assert.ok(ga);
  assert.match(ga.body, /offertemand_verzonden/);
  assert.doesNotMatch(ga.body, /totaalwaarde/);
  assert.ok(ads);
  assert.doesNotMatch(ads.body, /jan.jansen/i);
  assert.match(ads.body, new RegExp(sha256("janjansen@gmail.com")));
  assert.match(ads.body, new RegExp(GCLID));

  calls.length = 0;
  await trackServerEvent("configurator_gestart", { type: "vast-raam" }, { consent: true, clientId: CLIENT, gclid: GCLID }, env, fetchImpl);
  assert.equal(calls.some((call) => call.url.includes("uploadClickConversions") || call.url.includes("oauth2")), false);
  assert.equal(calls.some((call) => call.url.includes("google-analytics.com")), true);

  const staal = new Request("https://kunststof-gevel.nl/api/staalaanvraag", { headers: { cookie: cookie() } });
  calls.length = 0;
  await trackStaal({ request: staal, count: 2, email: "a@example.com", phone: "0612345678" }, env, fetchImpl);
  const staalAds = calls.find((call) => call.url.includes("uploadClickConversions"));
  assert.match(staalAds?.body ?? "", /888/);
  assert.doesNotMatch(staalAds?.body ?? "", /conversionValue/);
});

test("the browser endpoint refuses conversion events and stays quiet without consent", async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response(null, { status: 204 });
  };
  const env = { TRACKING_GA4_ACTIEF: "true", GA4_MEASUREMENT_ID: "G-TEST", GA4_API_SECRET: "geheim" };
  const spoof = await acceptClientEvent(
    new Request("https://kunststof-gevel.nl/api/tracking/gebeurtenis", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.8", cookie: cookie() },
      body: JSON.stringify({ name: "offertemand_verzonden", params: { aantal_kozijnen: 1 } }),
    }),
    env,
    fetchImpl,
  );
  assert.equal(spoof.status, 400);
  const quiet = await acceptClientEvent(
    new Request("https://kunststof-gevel.nl/api/tracking/gebeurtenis", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.9" },
      body: JSON.stringify({ name: "configurator_gestart", params: { type: "vast-raam" } }),
    }),
    env,
    fetchImpl,
  );
  assert.equal(quiet.status, 204);
  const allowed = await acceptClientEvent(
    new Request("https://kunststof-gevel.nl/api/tracking/gebeurtenis", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.10", cookie: cookie() },
      body: JSON.stringify({ name: "configurator_afgerond", params: { type: "vast-raam", waarde_excl: 12.5, inkoop: 1 } }),
    }),
    env,
    fetchImpl,
  );
  assert.equal(allowed.status, 204);
  assert.equal(calls, 1);
});

test("shopify orders forward only with the consent attribute", async () => {
  resetAdsTokenCache();
  const secret = "webhook-geheim";
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    calls.push(String(input));
    if (String(input).includes("oauth2")) return new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }), { status: 200 });
    return new Response("{}", { status: 200 });
  };
  const env = {
    SHOPIFY_WEBHOOK_SECRET: secret,
    SHOPIFY_STORE_DOMAIN: "shop.myshopify.com",
    TRACKING_GA4_ACTIEF: "true",
    GA4_MEASUREMENT_ID: "G-TEST",
    GA4_API_SECRET: "geheim",
    TRACKING_ADS_ACTIEF: "true",
    GOOGLE_ADS_DEVELOPER_TOKEN: "dev",
    GOOGLE_ADS_CUSTOMER_ID: "1234567890",
    GOOGLE_ADS_CLIENT_ID: "client",
    GOOGLE_ADS_CLIENT_SECRET: "secret",
    GOOGLE_ADS_REFRESH_TOKEN: "refresh",
    GOOGLE_ADS_CONVERSION_BESTELLING: "777",
  };
  const silent = { id: 10, currency: "EUR", total_price: "10.00", email: "a@example.com" };
  assert.equal(parseOrderTracking(silent)?.consent, false);
  const rawSilent = JSON.stringify(silent);
  const ignored = await handleOrderWebhook(signed(rawSilent, secret, "orders/create"), env, fetchImpl);
  assert.equal(ignored.status, 200);
  assert.equal(calls.length, 0);

  const order = {
    id: 11,
    currency: "EUR",
    total_price: "49.50",
    email: "A@Example.com",
    phone: "06 12345678",
    note_attributes: [
      { name: "_kg_consent", value: "granted" },
      { name: "_kg_client", value: CLIENT },
      { name: "_kg_gclid", value: GCLID },
    ],
  };
  const raw = JSON.stringify(order);
  const ok = await handleOrderWebhook(signed(raw, secret, "orders/create"), env, fetchImpl);
  assert.equal(ok.status, 200);
  assert.equal(calls.some((url) => url.includes("uploadClickConversions")), true);
  const bad = await handleOrderWebhook(signed(raw, "ander-geheim", "orders/create"), env, fetchImpl);
  assert.equal(bad.status, 401);
  const other = await handleOrderWebhook(signed(raw, secret, "orders/updated"), env, fetchImpl);
  assert.equal((await other.json()).ignored, true);
});

test("checkout attributes and quote value follow consent and the price flag", () => {
  assert.deepEqual(adsCheckoutAttributes(null), []);
  const rows = adsCheckoutAttributes({ clientId: CLIENT, gclid: GCLID });
  assert.deepEqual(rows.map((row) => row.key), ["_kg_consent", "_kg_client", "_kg_gclid"]);
  const layout = getLayoutBySlug("vast-raam");
  assert.ok(layout);
  const config = defaultConfig(layout);
  assert.equal(quoteTotalExcl(config, { KOZIJNEN_PRIJZEN_ACTIEF: "false" }), undefined);
  assert.equal(typeof quoteTotalExcl(config, { KOZIJNEN_PRIJZEN_ACTIEF: "true" }), "number");
  assert.equal(quoteTotalExcl({ ...config, screen: "inzet" }, { KOZIJNEN_PRIJZEN_ACTIEF: "true" }), undefined);
});

test("a redirect keeps a valid click id and drops the rest of the query", () => {
  const decision = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/product/keralit-siding",
    search: `?gclid=${GCLID}&utm_source=google`,
  });
  assert.equal(decision.action, "redirect");
  if (decision.action !== "redirect") return;
  assert.match(decision.search, new RegExp(`gclid=${GCLID}`));
  assert.doesNotMatch(decision.search, /utm_source/);
  const dropped = resolveNavigation({
    host: "www.kunststof-gevel.nl",
    pathname: "/product/keralit-siding",
    search: "?gclid=kort",
  });
  if (dropped.action !== "redirect") return;
  assert.equal(dropped.search.includes("gclid"), false);
});

test("tracking posts are rate limited per address", async () => {
  const env = offEnv;
  const fetchImpl: typeof fetch = async () => new Response(null, { status: 204 });
  let last = 200;
  for (let i = 0; i < 41; i += 1) {
    const response = await acceptClientEvent(
      new Request("https://kunststof-gevel.nl/api/tracking/gebeurtenis", {
        method: "POST",
        headers: { "x-forwarded-for": "10.9.9.9" },
        body: JSON.stringify({ name: "configurator_gestart", params: { type: "vast-raam" } }),
      }),
      env,
      fetchImpl,
    );
    last = response.status;
  }
  assert.equal(last, 429);
});

function signed(raw: string, secret: string, topic: string) {
  const hmac = createHmac("sha256", secret).update(raw, "utf8").digest("base64");
  return new Request("https://kunststof-gevel.nl/api/tracking/shopify", {
    method: "POST",
    headers: {
      "x-shopify-hmac-sha256": hmac,
      "x-shopify-topic": topic,
      "x-shopify-shop-domain": "shop.myshopify.com",
      "content-type": "application/json",
    },
    body: raw,
  });
}
