import assert from "node:assert/strict";
import test from "node:test";

import {
  gtmDataLayerScript,
  gtmLoaderScript,
  gtmMarkupId,
  gtmNoscriptHtml,
  resolveGtmId,
} from "../src/lib/tracking/gtm.ts";

test("GTM stays off on preview and on until the production domain", () => {
  assert.equal(resolveGtmId("kunststofgevel-website.onrender.com", undefined), null);
  assert.equal(resolveGtmId("foo.onrender.com:443", "GTM-N3DQ6G5"), null);
  assert.equal(resolveGtmId("www.kunststof-gevel.nl", undefined), "GTM-N3DQ6G5");
  assert.equal(resolveGtmId("kunststof-gevel.nl", ""), "GTM-N3DQ6G5");
  assert.equal(resolveGtmId("www.kunststof-gevel.nl", "GTM-ANDERS1"), "GTM-ANDERS1");
  assert.equal(resolveGtmId("www.kunststof-gevel.nl", "uit"), null);
  assert.equal(resolveGtmId("127.0.0.1:4366", ""), null);
  assert.equal(resolveGtmId("127.0.0.1", "GTM-N3DQ6G5"), "GTM-N3DQ6G5");
  assert.equal(gtmMarkupId(undefined), "GTM-N3DQ6G5");
  assert.equal(gtmMarkupId("uit"), null);
});

test("the head defines dataLayer before the GTM loader", () => {
  const dataLayer = gtmDataLayerScript();
  const loader = gtmLoaderScript(undefined);
  assert.match(dataLayer, /^window\.dataLayer = window\.dataLayer \|\| \[\];/);
  assert.equal(dataLayer.includes("googletagmanager"), false);
  assert.match(dataLayer, /ad_storage: 'denied'/);
  assert.match(loader, /onrender\.com/);
  assert.match(loader, /https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=/);
  assert.ok(loader.indexOf("onrender.com") < loader.indexOf("googletagmanager.com"));
  const noscript = gtmNoscriptHtml("GTM-N3DQ6G5");
  assert.match(noscript, /ns\.html\?id=GTM-N3DQ6G5/);
  assert.match(noscript, /display:none;visibility:hidden/);
});
