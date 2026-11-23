import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import { readFileSync } from "node:fs";
import test from "node:test";
import tls from "node:tls";

import { POST } from "../src/app/api/showroom/route.ts";
import { footerColumns } from "../src/lib/site.ts";
import { lookupRedirect, resolveNavigation } from "../src/lib/seo/redirects.ts";
import { uspBySection } from "../src/lib/usp.ts";
import {
  addShowroomDays,
  emptyShowroom,
  parseShowroomDay,
  rateLimitShowroom,
  resetShowroomRateLimit,
  SHOWROOM_DESCRIPTION,
  SHOWROOM_TAG,
  showroomCustomerText,
  showroomDealflow,
  showroomFaqs,
  showroomJsonLd,
  showroomShopText,
  showroomToday,
  validateShowroom,
  type ShowroomInput,
} from "../src/lib/showroom.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

function upcomingSunday(start = showroomToday()) {
  let iso = addShowroomDays(start, 1);
  for (let i = 0; i < 8; i += 1) {
    if (parseShowroomDay(iso)?.sunday) return iso;
    iso = addShowroomDays(iso, 1);
  }
  throw new Error("geen zondag");
}

function pastWeekday(start = showroomToday()) {
  let iso = addShowroomDays(start, -1);
  for (let i = 0; i < 8; i += 1) {
    const parsed = parseShowroomDay(iso);
    if (parsed && !parsed.sunday) return iso;
    iso = addShowroomDays(iso, -1);
  }
  throw new Error("geen verleden dag");
}

function openDay(offset = 0, start = showroomToday()) {
  let iso = addShowroomDays(start, offset);
  for (let i = 0; i < 8; i += 1) {
    if (parseShowroomDay(iso) && !parseShowroomDay(iso)?.sunday) return iso;
    iso = addShowroomDays(iso, 1);
  }
  return iso;
}

function validInput(overrides: Partial<ShowroomInput> = {}): ShowroomInput {
  return emptyShowroom({
    name: "Jan Test",
    email: "jan@example.com",
    phone: "06 12345678",
    postcode: "5321ka",
    day: openDay(),
    part: "ochtend",
    interests: ["Gevelbekleding", "HPL", "Sloop"],
    message: "Graag de houtlook zien.",
    includeSamples: true,
    samples: ["Keralit sponning wit", "Profex rabat"],
    companyWebsite: "",
    ...overrides,
  });
}

test("showroom validation rejects sunday, a past day and an empty request", () => {
  const ok = validInput();
  assert.equal(validateShowroom(ok), null);
  assert.equal(ok.postcode, "5321 KA");
  assert.equal(ok.part, "Ochtend");
  assert.deepEqual(ok.interests, ["Gevelbekleding", "HPL"]);
  assert.deepEqual(ok.samples, ["Keralit sponning wit"]);

  assert.match(validateShowroom(validInput({ day: upcomingSunday() })) ?? "", /zondag/i);
  assert.match(validateShowroom(validInput({ day: pastWeekday() })) ?? "", /latere dag/);
  assert.match(validateShowroom(validInput({ day: "2026-02-31" })) ?? "", /geldige voorkeursdag/);
  assert.match(validateShowroom(validInput({ day: addShowroomDays(showroomToday(), 200) })) ?? "", /half jaar/);
  assert.match(validateShowroom(validInput({ name: "J" })) ?? "", /naam/i);
  assert.match(validateShowroom(validInput({ email: "geen-adres" })) ?? "", /e-mail/i);
  assert.match(validateShowroom(validInput({ phone: "123" })) ?? "", /telefoon/i);
  assert.match(validateShowroom(validInput({ postcode: "0123 AB" })) ?? "", /1234 AB/);
  assert.match(validateShowroom(validInput({ part: "avond" })) ?? "", /ochtend of middag/);
  assert.match(validateShowroom(validInput({ interests: [] })) ?? "", /kijken/);
  assert.equal(validateShowroom(validInput({ part: "middag", day: openDay(6) })), null);

  const hidden = emptyShowroom({
    ...validInput(),
    includeSamples: false,
    samples: ["Keralit sponning wit"],
  });
  assert.deepEqual(hidden.samples, []);
  assert.equal(hidden.includeSamples, false);
});

test("showroom mail, faq and schema stay on known facts", () => {
  const input = validInput();
  const shop = showroomShopText(input, "SR-TEST1234");
  const customer = showroomCustomerText(input, "SR-TEST1234");
  const deal = showroomDealflow(input, "SR-TEST1234");
  const blob = [shop, customer, JSON.stringify(showroomFaqs), SHOWROOM_DESCRIPTION, JSON.stringify(showroomJsonLd())].join(
    "\n",
  );
  assert.match(shop, /Bron: Showroomafspraak/);
  assert.match(shop, /Voorkeursdag:/);
  assert.match(shop, /Gevelbekleding, HPL/);
  assert.match(shop, /Keralit sponning wit/);
  assert.equal(shop.includes("Profex"), false);
  assert.match(customer, /nog geen bevestigde afspraak/i);
  assert.match(customer, /Binnenkamp 7a, 5321 KA Hedel/);
  assert.match(customer, /030 227 1397/);
  assert.equal(deal.submission.submissionId, "SR-TEST1234");
  assert.equal(deal.submission.questions.find((item) => item.name === "Email")?.value, "jan@example.com");
  assert.equal(deal.submission.questions.find((item) => item.name === "Voorkeursdag")?.value, input.day);
  assert.equal(deal.submission.questions.find((item) => item.name === "Bron")?.value, "Showroomafspraak");
  assert.equal(blob.includes("\u2014") || blob.includes("\u2013"), false);
  assert.equal(/duafort|profex|canexel/i.test(blob), false);
  assert.equal(/085[\s-]?4010650|06[\s-]?46011057/.test(blob), false);
  assert.equal(/buiten/i.test(blob), false);
  const schema = showroomJsonLd();
  assert.deepEqual(schema["@type"], ["Store", "LocalBusiness"]);
  assert.equal(schema.address.streetAddress, "Binnenkamp 7a");
  assert.equal(schema.address.postalCode, "5321 KA");
  assert.equal(schema.address.addressLocality, "Hedel");
  assert.equal(showroomFaqs.length >= 3 && showroomFaqs.length <= 4, true);
});

test("old showroom urls reach /showroom in one hop and the page is linked", () => {
  for (const path of ["/showroom-kunststof-gevel", "/showroom-kunststof-gevel/"]) {
    const row = lookupRedirect(path);
    assert.equal(row.status, "301", path);
    assert.equal(row.to, "/showroom", path);
    const decision = resolveNavigation({ host: "www.kunststof-gevel.nl", pathname: path, search: "" });
    assert.equal(decision.action, "redirect", path);
    if (decision.action !== "redirect") continue;
    assert.equal(decision.pathname, "/showroom", path);
    assert.equal(decision.host, null, path);
  }
  const slash = resolveNavigation({ host: "www.kunststof-gevel.nl", pathname: "/showroom/", search: "" });
  assert.equal(slash.action, "redirect");
  if (slash.action === "redirect") assert.equal(slash.pathname, "/showroom");
  assert.equal(lookupRedirect("/showroom").status, "200");
  assert.equal(lookupRedirect("/showroom").to, "/showroom");

  const showroomUsp = uspBySection.site.find((item) => item.k === "Showroom");
  assert.equal(showroomUsp?.href, "/showroom");
  assert.match(`${showroomUsp?.k} ${showroomUsp?.v}`, /Showroom op afspraak in Hedel/);
  const footer = footerColumns.flatMap((column) => column.links);
  assert.equal(footer.some((item) => item.href === "/showroom" && item.label === "Showroom Hedel"), true);

  const page = read("../src/app/showroom/page.tsx");
  const form = read("../src/components/showroom/appointment-form.tsx");
  const contact = read("../src/app/contact/page.tsx");
  const footerView = read("../src/components/site-footer.tsx");
  const strip = read("../src/components/brand/facts-strip.tsx");
  const header = read("../src/components/site-header.tsx");
  const visible = [page, form, contact, footerView, strip].join("\n");
  assert.match(contact, /href="\/showroom"/);
  assert.match(footerView, /href="\/showroom"/);
  assert.match(strip, /item\.href/);
  assert.equal(header.includes("/showroom"), false);
  assert.match(page, /showroomJsonLd/);
  assert.match(page, /faqJsonLd/);
  assert.match(form, /type="date"/);
  assert.match(form, /Neem gekozen stalen mee/);
  assert.match(form, /nog geen bevestigde afspraak|Dit is een aanvraag/);
  assert.equal(visible.includes("\u2014") || visible.includes("\u2013"), false);
  assert.equal(/duafort|profex|canexel/i.test(visible), false);
  assert.equal(/085[\s-]?4010650|06[\s-]?46011057/.test(visible), false);
  assert.equal(/vensterbank[^.]*buiten|buiten[^.]*vensterbank/i.test(visible), false);
});

test("the showroom route rejects a bad request and a sunday", async () => {
  const broken = await POST(new Request("http://kunststof-gevel.test/api/showroom", { method: "POST", body: "{" }));
  assert.equal(broken.status, 400);

  const sunday = await POST(
    new Request("http://kunststof-gevel.test/api/showroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validInput(), day: upcomingSunday(), part: "Middag" }),
    }),
  );
  const sundayBody = (await sunday.json()) as { ok?: boolean; error?: string };
  assert.equal(sunday.status, 400);
  assert.match(sundayBody.error ?? "", /zondag/i);

  const honeypot = await POST(
    new Request("http://kunststof-gevel.test/api/showroom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validInput(), companyWebsite: "https://spam.example" }),
    }),
  );
  const honeypotBody = (await honeypot.json()) as { ok?: boolean; reference?: string };
  assert.equal(honeypot.status, 200);
  assert.equal(honeypotBody.reference, "SKIP");

  resetShowroomRateLimit();
  for (let i = 0; i < 5; i += 1) assert.equal(rateLimitShowroom("203.0.113.8"), true);
  const limited = await POST(
    new Request("http://kunststof-gevel.test/api/showroom", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.8" },
      body: JSON.stringify(validInput()),
    }),
  );
  assert.equal(limited.status, 429);
  resetShowroomRateLimit();
});

const CERT = "/tmp/kg-showroom-cert.pem";
const KEY = "/tmp/kg-showroom-key.pem";

function ensureCert() {
  if (fs.existsSync(CERT) && fs.existsSync(KEY)) return;
  execFileSync(
    "openssl",
    ["req", "-x509", "-newkey", "rsa:2048", "-keyout", KEY, "-out", CERT, "-days", "1", "-nodes", "-subj", "/CN=127.0.0.1"],
    { stdio: "ignore" },
  );
}

function startSmtp() {
  ensureCert();
  const messages: string[] = [];
  const server = tls.createServer({ cert: fs.readFileSync(CERT), key: fs.readFileSync(KEY) }, (socket) => {
    socket.write("220 localhost ESMTP\r\n");
    let buf = "";
    let dataMode = false;
    socket.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      if (dataMode) {
        const end = buf.indexOf("\r\n.\r\n");
        if (end === -1) return;
        messages.push(buf.slice(0, end));
        buf = buf.slice(end + 5);
        dataMode = false;
        socket.write("250 OK\r\n");
      }
      const lines = buf.split("\r\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (/^DATA$/i.test(line)) {
          dataMode = true;
          socket.write("354 Go ahead\r\n");
        } else if (/^QUIT$/i.test(line)) {
          socket.write("221 Bye\r\n");
          socket.end();
        } else {
          socket.write("250 OK\r\n");
        }
      }
    });
  });
  return new Promise<{ port: number; close: () => Promise<void>; messages: string[] }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as net.AddressInfo;
      resolve({
        port: address.port,
        messages,
        close: () =>
          new Promise((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

const ENV_KEYS = [
  "DEALFLOW_WEBHOOK_URL",
  "DEALFLOW_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "LEAD_EMAIL_PROVIDER",
  "LEAD_EMAIL_FROM",
  "LEAD_EMAIL_TO",
  "ACTIVECAMPAIGN_API_URL",
  "ACTIVECAMPAIGN_API_KEY",
  "ACTIVECAMPAIGN_LIST_ID",
  "NODE_TLS_REJECT_UNAUTHORIZED",
] as const;

test("the showroom route mails info@, tags showroomafspraak and posts the deal intake", async () => {
  const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const smtp = await startSmtp();
  const secret = "niet-in-de-log";
  const acKey = "ac-sleutel-niet-loggen";
  const lines: string[] = [];
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalError = console.error;
  const calls: { url: string; body?: unknown; authorization?: string | null }[] = [];
  const originalFetch = globalThis.fetch;
  console.warn = (...args: unknown[]) => {
    lines.push(args.map((part) => String(part)).join(" "));
  };
  console.info = (...args: unknown[]) => {
    lines.push(args.map((part) => String(part)).join(" "));
  };
  console.error = (...args: unknown[]) => {
    lines.push(args.map((part) => String(part)).join(" "));
  };
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const href = String(url);
    calls.push({
      url: href,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      authorization: new Headers(init?.headers).get("authorization"),
    });
    if (href.includes("/tags?")) return Response.json({ tags: [] });
    if (href.endsWith("/api/3/tags")) return Response.json({ tag: { id: "77" } });
    if (href.includes("/contact/sync")) return Response.json({ contact: { id: 99 } });
    return Response.json({ ok: true });
  }) as typeof fetch;

  try {
    for (const key of ENV_KEYS) delete process.env[key];
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(smtp.port);
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "info@kunststof-gevel.nl";
    process.env.SMTP_PASS = "app-password";
    process.env.LEAD_EMAIL_PROVIDER = "smtp";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    process.env.DEALFLOW_WEBHOOK_URL = "https://kunststofgevel.onrender.com/api/intake/fillout";
    process.env.DEALFLOW_WEBHOOK_SECRET = secret;
    process.env.ACTIVECAMPAIGN_API_URL = "https://ac.example.com";
    process.env.ACTIVECAMPAIGN_API_KEY = acKey;
    process.env.ACTIVECAMPAIGN_LIST_ID = "19";

    resetShowroomRateLimit();
    const response = await POST(
      new Request("http://kunststof-gevel.test/api/showroom", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9" },
        body: JSON.stringify({
          ...validInput(),
          samples: ["Keralit sponning wit", "Canexel plaat"],
        }),
      }),
    );
    const body = (await response.json()) as { ok?: boolean; error?: string; reference?: string };
    assert.equal(response.status, 200, body.error);
    assert.equal(body.ok, true);
    assert.match(body.reference ?? "", /^SR-/);
    assert.equal(smtp.messages.length, 2);
    const joined = smtp.messages.join("\n");
    assert.match(joined, /To: info@kunststof-gevel\.nl/);
    assert.match(joined, /To: jan@example.com/);
    assert.match(joined, /From: kunststof-gevel\.nl <info@kunststof-gevel\.nl>/);
    assert.match(joined, /Showroomafspraak/);
    assert.match(joined, /Keralit sponning wit/);
    assert.equal(/canexel|profex|duafort/i.test(joined), false);
    assert.equal(joined.includes("app-password"), false);
    assert.equal(joined.includes(secret), false);
    assert.equal(joined.includes(acKey), false);

    const tagCreate = calls.find((call) => call.url.endsWith("/api/3/tags"));
    assert.deepEqual(tagCreate?.body, { tag: { tag: SHOWROOM_TAG, tagType: "contact" } });
    const linked = calls.find((call) => call.url.endsWith("/contactTags"));
    assert.deepEqual(linked?.body, { contactTag: { contact: "99", tag: "77" } });
    const intake = calls.find((call) => call.url.includes("/api/intake/fillout"));
    const questions = (intake?.body as { submission?: { questions?: { name: string; value: string }[] } })?.submission
      ?.questions;
    assert.equal(questions?.find((item) => item.name === "Bron")?.value, "Showroomafspraak");
    assert.equal(questions?.some((item) => item.value.includes("Canexel")), false);
    assert.equal(intake?.authorization, `Bearer ${secret}`);
    const logged = lines.join("\n");
    assert.match(logged, /\[dealflow\] ok/);
    assert.equal(logged.includes(secret), false);
    assert.equal(logged.includes(acKey), false);
    assert.equal(logged.includes("app-password"), false);
  } finally {
    console.warn = originalWarn;
    console.info = originalInfo;
    console.error = originalError;
    globalThis.fetch = originalFetch;
    await smtp.close();
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    resetShowroomRateLimit();
  }
});
