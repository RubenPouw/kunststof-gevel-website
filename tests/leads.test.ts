import assert from "node:assert/strict";
import test from "node:test";

import { leadDeliveryError, submitQuoteLead, submitSampleLead } from "../src/lib/leads.ts";
import { validateQuote } from "../src/lib/quote.ts";
import { site } from "../src/lib/site.ts";

const quote = {
  name: "Test Klant",
  email: "test@example.com",
  phone: "0302271397",
  city: "Utrecht",
  areaM2: "40",
  profile: "Sponningdeel",
  message: "",
  wantsMontage: false,
  companyWebsite: "",
};

test("the confirmed BTW number is used for the company", () => {
  assert.equal(site.btw, "NL856594842B01");
  assert.equal(site.email, "info@kunststof-gevel.nl");
});

test("validateQuote rejects a missing phone", () => {
  assert.match(validateQuote({ ...quote, phone: "12" }) ?? "", /telefoon/);
});

test("a honeypot quote does not need a mail provider", async () => {
  const result = await submitQuoteLead({ ...quote, companyWebsite: "https://spam.example" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.reference, "SKIP");
});

const leadEnvKeys = [
  "LEAD_EMAIL_PROVIDER",
  "LEAD_EMAIL_FROM",
  "LEAD_EMAIL_TO",
  "RESEND_API_KEY",
  "MAILERSEND_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "ACTIVECAMPAIGN_API_URL",
  "ACTIVECAMPAIGN_API_KEY",
] as const;

function clearLeadEnv() {
  for (const key of leadEnvKeys) delete process.env[key];
}

test("a real quote fails closed when no delivery channel is configured", async () => {
  clearLeadEnv();
  const result = await submitQuoteLead(quote);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, leadDeliveryError());
  assert.match(result.error, /030 227 1397/);
});

test("lead mail defaults to the Google Workspace mailbox", async () => {
  const { leadMailPlan } = await import("../src/lib/mail.ts");
  clearLeadEnv();
  const closed = leadMailPlan();
  assert.equal(closed.provider, null);
  assert.equal(closed.ready, false);
  assert.equal(closed.from, "info@kunststof-gevel.nl");
  assert.equal(closed.to, "info@kunststof-gevel.nl");
  assert.equal(closed.host, "smtp.gmail.com");
  assert.equal(closed.port, 587);
  assert.equal(closed.user, "info@kunststof-gevel.nl");

  process.env.SMTP_PASS = "app-password";
  const gmail = leadMailPlan();
  assert.equal(gmail.provider, "smtp");
  assert.equal(gmail.ready, true);
  assert.equal(gmail.from, "info@kunststof-gevel.nl");
  assert.equal(gmail.to, "info@kunststof-gevel.nl");

  process.env.SMTP_PORT = "465";
  assert.equal(leadMailPlan().port, 465);

  process.env.LEAD_EMAIL_PROVIDER = "resend";
  process.env.RESEND_API_KEY = "re_test";
  const resend = leadMailPlan();
  assert.equal(resend.provider, "resend");
  assert.equal(resend.ready, true);
  clearLeadEnv();
});

test("a sample request without samples is rejected before delivery", async () => {
  const result = await submitSampleLead({
    name: "Test Klant",
    email: "test@example.com",
    phone: "0302271397",
    address: "Spinsterlaan 6A",
    postcode: "3454 WZ",
    city: "Utrecht",
    samples: "",
    companyWebsite: "",
  });
  assert.equal(result.ok, false);
});
