import assert from "node:assert/strict";
import test from "node:test";

import { leadDeliveryError, submitQuoteLead, submitSampleLead } from "../src/lib/leads.ts";
import { validateQuote } from "../src/lib/quote.ts";

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

test("validateQuote rejects a missing phone", () => {
  assert.match(validateQuote({ ...quote, phone: "12" }) ?? "", /telefoon/);
});

test("a honeypot quote does not need a mail provider", async () => {
  const result = await submitQuoteLead({ ...quote, companyWebsite: "https://spam.example" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.reference, "SKIP");
});

test("a real quote fails closed when no delivery channel is configured", async () => {
  delete process.env.LEAD_EMAIL_PROVIDER;
  delete process.env.LEAD_EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  delete process.env.MAILERSEND_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.ACTIVECAMPAIGN_API_URL;
  delete process.env.ACTIVECAMPAIGN_API_KEY;
  const result = await submitQuoteLead(quote);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, leadDeliveryError());
  assert.match(result.error, /030 227 1397/);
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
