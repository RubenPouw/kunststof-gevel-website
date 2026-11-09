import assert from "node:assert/strict";
import test from "node:test";

import { syncActiveCampaignContact } from "../src/lib/activecampaign.ts";
import { staalAcTags } from "../src/lib/leads.ts";
import { buildDealflowPayload, postDealflow } from "../src/lib/staal/dealflow.ts";

test("dealflow posts the Fillout submission and logs the dashboard status", async () => {
  const secret = "niet-in-de-log";
  const payload = buildDealflowPayload({
    reference: "ST-1",
    name: "Jan Test",
    email: "jan@example.com",
    phone: "0612345678",
    postcode: "3454 WZ",
    houseNumber: "6",
    wantsQuote: true,
    dimensions: "12 m2",
    lines: ["Keralit sponning 143 mm: Wit 9016", "VinyPlus Shadow: Turners eiken"],
  });
  assert.deepEqual(payload, {
    submission: {
      submissionId: "ST-1",
      questions: [
        { name: "Email", value: "jan@example.com" },
        { name: "Naam", value: "Jan Test" },
        { name: "Telefoon", value: "0612345678" },
        { name: "Postcode", value: "3454 WZ" },
        { name: "Huisnummer", value: "6" },
        { name: "Afmetingen", value: "12 m2" },
        { name: "Stalen", value: "Keralit sponning 143 mm: Wit 9016\nVinyPlus Shadow: Turners eiken" },
        { name: "Prijsindicatie", value: "ja" },
      ],
    },
  });
  assert.equal("contact" in payload, false);

  const previousUrl = process.env.DEALFLOW_WEBHOOK_URL;
  const previousSecret = process.env.DEALFLOW_WEBHOOK_SECRET;
  process.env.DEALFLOW_WEBHOOK_URL = "https://kunststofgevel.onrender.com/api/intake/fillout";
  process.env.DEALFLOW_WEBHOOK_SECRET = secret;
  const lines: string[] = [];
  const originalWarn = console.warn;
  const originalInfo = console.info;
  console.warn = (...args: unknown[]) => {
    lines.push(args.map((part) => String(part)).join(" "));
  };
  console.info = (...args: unknown[]) => {
    lines.push(args.map((part) => String(part)).join(" "));
  };
  let headers: Record<string, string> = {};
  try {
    const failed = await postDealflow(payload, {
      fetchImpl: (async (_url: string, init?: RequestInit) => {
        headers = init?.headers as Record<string, string>;
        assert.deepEqual(JSON.parse(String(init?.body)), payload);
        return new Response(`fout ${secret}`, { status: 400 });
      }) as typeof fetch,
    });
    assert.equal(failed.ok, false);
    assert.equal(headers.Authorization, `Bearer ${secret}`);
    assert.equal(headers["x-dealflow-secret"], secret);
    assert.equal(headers["X-Fillout-Secret"], secret);
    assert.match(lines.join("\n"), /\[dealflow\] failed 400 fout/);
    assert.equal(lines.join("\n").includes(secret), false);

    lines.length = 0;
    const ok = await postDealflow(payload, {
      fetchImpl: (async () => new Response("{}", { status: 200 })) as typeof fetch,
    });
    assert.equal(ok.ok, true);
    assert.match(lines.join("\n"), /\[dealflow\] ok 200/);
  } finally {
    console.warn = originalWarn;
    console.info = originalInfo;
    if (previousUrl === undefined) delete process.env.DEALFLOW_WEBHOOK_URL;
    else process.env.DEALFLOW_WEBHOOK_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.DEALFLOW_WEBHOOK_SECRET;
    else process.env.DEALFLOW_WEBHOOK_SECRET = previousSecret;
  }
});

test("ActiveCampaign upserts the contact, lists it and reuses existing staal tags", async () => {
  assert.deepEqual(staalAcTags(["Keralit sponning: Wit 9016", "VinyPlus rabat: Antraciet"]), [
    "staalaanvraag",
    "staal-keralit",
    "staal-vinyplus",
  ]);
  assert.deepEqual(staalAcTags(["Eurotexx: Wit"]), ["staalaanvraag"]);

  const previousUrl = process.env.ACTIVECAMPAIGN_API_URL;
  const previousKey = process.env.ACTIVECAMPAIGN_API_KEY;
  const previousList = process.env.ACTIVECAMPAIGN_LIST_ID;
  process.env.ACTIVECAMPAIGN_API_URL = "https://ac.example.com";
  process.env.ACTIVECAMPAIGN_API_KEY = "ac-sleutel";
  process.env.ACTIVECAMPAIGN_LIST_ID = "19";
  const calls: { url: string; method: string; body?: unknown; token?: string }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url);
    calls.push({
      url: href,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      token: new Headers(init?.headers).get("Api-Token") ?? undefined,
    });
    if (href.includes("/tags?")) {
      return Response.json({
        tags: [
          { id: "6", tag: "StaalAanvraag" },
          { id: "12", tag: "staal-keralit" },
          { id: "11", tag: "staal-vinyplus" },
        ],
      });
    }
    if (href.includes("/contact/sync")) return Response.json({ contact: { id: 99 } });
    return Response.json({});
  }) as typeof fetch;
  try {
    const result = await syncActiveCampaignContact({
      email: "jan@example.com",
      firstName: "Jan",
      lastName: "Test",
      phone: "0612345678",
      tags: ["staalaanvraag", "staal-keralit", "staal-vinyplus"],
    });
    assert.equal(result.ok, true);
    assert.equal(calls.some((call) => call.token === "ac-sleutel"), true);
    assert.deepEqual(calls[0]?.body, {
      contact: { email: "jan@example.com", firstName: "Jan", lastName: "Test", phone: "0612345678" },
    });
    assert.equal(String(calls[0]?.url).endsWith("/api/3/contact/sync"), true);
    assert.deepEqual(
      calls.find((call) => call.url.endsWith("/contactLists"))?.body,
      { contactList: { list: "19", contact: "99", status: 1 } },
    );
    const linked = calls.filter((call) => call.url.endsWith("/contactTags")).map((call) => call.body);
    assert.deepEqual(linked, [
      { contactTag: { contact: "99", tag: "6" } },
      { contactTag: { contact: "99", tag: "12" } },
      { contactTag: { contact: "99", tag: "11" } },
    ]);
    assert.equal(
      calls.some((call) => call.method === "POST" && call.url.endsWith("/api/3/tags")),
      false,
    );
  } finally {
    globalThis.fetch = original;
    if (previousUrl === undefined) delete process.env.ACTIVECAMPAIGN_API_URL;
    else process.env.ACTIVECAMPAIGN_API_URL = previousUrl;
    if (previousKey === undefined) delete process.env.ACTIVECAMPAIGN_API_KEY;
    else process.env.ACTIVECAMPAIGN_API_KEY = previousKey;
    if (previousList === undefined) delete process.env.ACTIVECAMPAIGN_LIST_ID;
    else process.env.ACTIVECAMPAIGN_LIST_ID = previousList;
  }
});
