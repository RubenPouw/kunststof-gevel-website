import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer as createTlsServer } from "node:tls";
import test from "node:test";

import { submitProjectQuoteLead } from "../src/lib/leads.ts";
import { leadMailPlan } from "../src/lib/mail.ts";
import {
  cleanProjectAttribution,
  cleanProjectQuoteReference,
  emptyProjectQuote,
  projectQuoteDataLayer,
  projectQuoteFileError,
  projectQuoteMail,
  PROJECT_QUOTE_EVENT,
  PROJECT_QUOTE_SOURCE,
  rateLimitProjectQuote,
  resetProjectQuoteRateLimit,
  validateProjectQuote,
  type ProjectQuoteInput,
} from "../src/lib/project-quote.ts";

const base: ProjectQuoteInput = {
  email: "info@kunststof-gevel.nl",
  bedrijfsnaam: "",
  voornaam: "TEST",
  achternaam: "Webshop",
  telefoon: "0302271397",
  adres: "Binnenkamp 7a",
  plaats: "Hedel",
  montage: ["Met montage"],
  delen: ["Gevel", "Kozijnen"],
  maand: "Maart",
  afmetingen: "Gevel circa 40 m2",
  companyWebsite: "",
  attribution: cleanProjectAttribution({
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "Search | Montage door Cavemen",
    gclid: "TeStGclid1234",
    gbraid: "kort",
  }),
};

test("only a successful send produces lead_submit", () => {
  assert.equal(projectQuoteDataLayer(false), null);
  assert.deepEqual(projectQuoteDataLayer(true), {
    event: "lead_submit",
    form_name: "Offerte formulier",
    form_location: "/projecten",
  });
  assert.equal(PROJECT_QUOTE_EVENT.form_name, "Offerte formulier");
});

test("the live offerte fields stay optional except e-mail", () => {
  assert.match(validateProjectQuote({ ...base, email: "" }) ?? "", /e-mail/i);
  assert.equal(validateProjectQuote({ ...base, voornaam: "", achternaam: "", telefoon: "", adres: "", plaats: "" }), null);
  assert.match(validateProjectQuote({ ...base, maand: "Week" }) ?? "", /maand/);
  assert.match(validateProjectQuote({ ...base, montage: ["Sloop"] }) ?? "", /montage|materiaal/);
  const parsed = emptyProjectQuote({
    email: "info@kunststof-gevel.nl",
    maand: "Selecteer",
    montage: ["Met montage", "Alleen materiaal", "Sloop"],
    delen: ["Gevel", "Dak"],
  });
  assert.equal(parsed.maand, "");
  assert.deepEqual(parsed.montage, ["Met montage", "Alleen materiaal"]);
  assert.deepEqual(parsed.delen, ["Gevel"]);
});

test("mail names the source, the test name and utm or gclid, and drops a short click id", () => {
  assert.equal(base.attribution.gbraid, undefined);
  const lines = projectQuoteMail(base, { reference: "OF-TEST1234", photoNames: ["gevel.jpg"] });
  const text = lines.join("\n");
  assert.match(text, new RegExp(`Bron: ${PROJECT_QUOTE_SOURCE}`));
  assert.match(text, /Naam: TEST Webshop/);
  assert.match(text, /utm_campaign: Search \| Montage door Cavemen/);
  assert.match(text, /gclid: TeStGclid1234/);
  assert.equal(text.includes("gbraid"), false);
  assert.equal(text.includes("\u2014") || text.includes("\u2013"), false);
  assert.equal(/duafort|profex|canexel|linerio|wonderboard/i.test(text), false);
  assert.equal(cleanProjectQuoteReference("OF-TEST1234"), "OF-TEST1234");
  assert.equal(cleanProjectQuoteReference("KG-1"), "");
});

test("uploads follow the live file types, with a size cap", () => {
  assert.equal(projectQuoteFileError([{ name: "a.pdf", type: "application/pdf", size: 100 }]), null);
  assert.match(projectQuoteFileError([{ name: "a.exe", type: "application/octet-stream", size: 100 }]) ?? "", /jpg/);
  assert.match(
    projectQuoteFileError([{ name: "a.jpg", type: "image/jpeg", size: 11 * 1024 * 1024 }]) ?? "",
    /10 MB/,
  );
});

test("five quotes in ten minutes stop the sixth", () => {
  resetProjectQuoteRateLimit();
  const now = 1_700_000_000_000;
  for (let i = 0; i < 5; i += 1) assert.equal(rateLimitProjectQuote("203.0.113.9", now + i), true);
  assert.equal(rateLimitProjectQuote("203.0.113.9", now + 6), false);
  assert.equal(rateLimitProjectQuote("203.0.113.10", now + 6), true);
  resetProjectQuoteRateLimit();
});

test("a honeypot or a bad address does not pretend the mail was sent", async () => {
  const honeypot = await submitProjectQuoteLead({ ...base, companyWebsite: "https://spam.example" });
  assert.equal(honeypot.ok, true);
  if (!honeypot.ok) return;
  assert.equal(honeypot.quiet, true);
  assert.equal(honeypot.reference, "SKIP");

  const invalid = await submitProjectQuoteLead({ ...base, email: "geen-adres" });
  assert.equal(invalid.ok, false);
});

test("the page puts the form after the first project and keeps the filter urls", () => {
  const page = readFileSync(new URL("../src/app/projecten/page.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../src/components/projects/project-quote-form.tsx", import.meta.url), "utf8");
  const first = page.indexOf("<ProjectRow");
  const quote = page.indexOf("<ProjectQuoteForm");
  assert.ok(first >= 0 && quote > first);
  assert.match(page, /href="#offerte"/);
  assert.match(page, /href=\{`\/projecten\?merk=\$\{brand\.slug\}`\}/);
  assert.equal(page.includes("MontageQuoteCard"), false);
  assert.match(form, /name="email"/);
  assert.match(form, /\["foto1", "foto2", "foto3"\]/);
  assert.match(form, /projectQuoteDataLayer\(tracked\)/);
  assert.equal(form.split("dataLayer.push").length - 1, 1);
  const visible = `${page}\n${form}`;
  assert.equal(visible.includes("\u2014"), false);
  assert.equal(/085-?4010650|06-?46011057|duafort|profex|canexel|linerio|wonderboard/i.test(visible), false);
});

test("a test quote for TEST Webshop is addressed only to info@", async () => {
  const messages: { rcpt: string[]; body: string }[] = [];
  const { generateTestCert } = await import("node:crypto");
  let key: string;
  let cert: string;
  try {
    const pair = generateTestCert();
    key = pair.key;
    cert = pair.cert;
  } catch {
    const { execSync } = await import("node:child_process");
    execSync(
      "openssl req -x509 -newkey rsa:2048 -keyout /tmp/kg-smtp-key.pem -out /tmp/kg-smtp-cert.pem -days 1 -nodes -subj /CN=127.0.0.1",
      { stdio: "ignore" },
    );
    key = readFileSync("/tmp/kg-smtp-key.pem", "utf8");
    cert = readFileSync("/tmp/kg-smtp-cert.pem", "utf8");
  }

  const server = createTlsServer({ key, cert }, (socket) => {
    let mode: "cmd" | "data" = "cmd";
    let auth: "no" | "user" | "pass" = "no";
    let buf = "";
    let body = "";
    const rcpt: string[] = [];
    socket.write("220 local ESMTP\r\n");
    socket.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (mode === "data") {
        body += text;
        if (body.includes("\r\n.\r\n")) {
          messages.push({ rcpt: [...rcpt], body });
          mode = "cmd";
          body = "";
          socket.write("250 queued\r\n");
        }
        return;
      }
      buf += text;
      while (mode === "cmd") {
        const idx = buf.indexOf("\r\n");
        if (idx < 0) break;
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const upper = line.toUpperCase();
        if (upper.startsWith("EHLO") || upper.startsWith("HELO")) socket.write("250-local\r\n250 AUTH LOGIN\r\n");
        else if (upper.startsWith("AUTH LOGIN")) {
          auth = "user";
          socket.write("334 VXNlcm5hbWU6\r\n");
        } else if (auth === "user") {
          auth = "pass";
          socket.write("334 UGFzc3dvcmQ6\r\n");
        } else if (auth === "pass") {
          auth = "no";
          socket.write("235 ok\r\n");
        } else if (upper.startsWith("RCPT TO")) {
          rcpt.push(line);
          socket.write("250 ok\r\n");
        } else if (upper === "DATA") {
          mode = "data";
          body = buf;
          buf = "";
          socket.write("354 go\r\n");
          if (body.includes("\r\n.\r\n")) {
            messages.push({ rcpt: [...rcpt], body });
            mode = "cmd";
            body = "";
            socket.write("250 queued\r\n");
          }
        } else if (upper === "QUIT") socket.write("221 bye\r\n");
        else socket.write("250 ok\r\n");
      }
    });
  });

  const previous = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  const keys = [
    "LEAD_EMAIL_PROVIDER",
    "LEAD_EMAIL_FROM",
    "LEAD_EMAIL_TO",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASS",
    "ACTIVECAMPAIGN_API_URL",
    "ACTIVECAMPAIGN_API_KEY",
    "RESEND_API_KEY",
    "MAILERSEND_API_KEY",
  ] as const;
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("geen poort");
    for (const key of keys) delete process.env[key];
    process.env.LEAD_EMAIL_PROVIDER = "smtp";
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(address.port);
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "info@kunststof-gevel.nl";
    process.env.SMTP_PASS = "niet-de-echte-sleutel";
    const plan = leadMailPlan();
    assert.equal(plan.to, "info@kunststof-gevel.nl");
    assert.equal(plan.ready, true);

    const result = await submitProjectQuoteLead(base, [
      { filename: "gevel.jpg", contentType: "image/jpeg", content: Buffer.from("foto") },
    ]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.quiet, false);
    assert.match(result.reference, /^OF-[0-9A-Z]+$/);
    assert.equal(messages.length, 1);
    assert.deepEqual(messages[0]?.rcpt, ["RCPT TO:<info@kunststof-gevel.nl>"]);
    assert.match(messages[0]?.body ?? "", /Naam: TEST Webshop/);
    assert.match(messages[0]?.body ?? "", /Bron: Offerte formulier \/projecten/);
    assert.match(messages[0]?.body ?? "", /gclid: TeStGclid1234/);
    assert.equal((messages[0]?.body ?? "").includes("niet-de-echte-sleutel"), false);
    assert.equal((messages[0]?.rcpt ?? []).some((line) => /klant@/i.test(line)), false);
  } finally {
    server.close();
    if (previous === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = previous;
    for (const key of keys) {
      const value = saved[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
