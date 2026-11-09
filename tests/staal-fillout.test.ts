import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import { POST } from "../src/app/api/staalaanvraag/route.ts";
import { leadDeliveryError } from "../src/lib/leads.ts";
import { missingMailEnv } from "../src/lib/mail.ts";
import { missingActiveCampaignEnv } from "../src/lib/activecampaign.ts";
import { buildDealflowPayload, postDealflow } from "../src/lib/staal/dealflow.ts";
import { applyFillout, filloutSteps, TREND_EXCLUDED } from "../src/lib/staal/fillout.ts";
import { staalPickerSections } from "../src/lib/staal/picker.ts";
import { buildStaalTree } from "../src/lib/staal/tree.ts";
import { resetStaalRateLimit } from "../src/lib/staal/rate-limit.ts";

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/deel\b/g, " ")
    .replace(/\bmm\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("every Fillout colour is in the picker with a local photo", () => {
  const sections = staalPickerSections(applyFillout(buildStaalTree(staticProducts)));
  const lines: string[] = [];
  for (const step of filloutSteps()) {
    const sectionId = step.section === "Dakrand" ? "dakrand" : "gevel";
    const groups = sections.find((section) => section.id === sectionId)?.groups ?? [];
    const needles = [step.groupTitle, ...step.needles].map(norm).filter(Boolean);
    let missing = step.colors.length;
    let groupTitle = "";
    let bestScore = 0;
    for (const group of groups) {
      const title = norm(group.title);
      const score = needles.reduce((best, needle) => {
        if (title.includes(needle) || needle.includes(title)) return Math.max(best, Math.min(needle.length, title.length));
        return best;
      }, 0);
      const absent = step.colors.filter((color) => {
        const swatch = group.swatches.find((item) => norm(item.name) === norm(color.label));
        return !swatch?.image?.startsWith("/staal/fillout/");
      });
      if (score > bestScore) {
        bestScore = score;
        missing = absent.length;
        groupTitle = group.title;
      }
    }
    lines.push(`${step.step}: ${step.colors.length - missing}/${step.colors.length} in "${groupTitle}", missing ${missing}`);
    assert.equal(missing, 0, lines.at(-1));
    for (const color of step.colors) {
      assert.equal(fs.existsSync(`public${color.image}`), true, color.image);
    }
  }
  const dakrand = sections.find((section) => section.id === "dakrand");
  const keralit = filloutSteps().find((step) => step.step === "Keralit kleur dakrand");
  assert.ok(dakrand && keralit);
  const holders = dakrand.groups.filter((group) =>
    keralit.colors.every((color) => group.swatches.some((swatch) => norm(swatch.name) === norm(color.label))),
  );
  assert.equal(holders.length, 1);
  lines.push(`Keralit dakrand lijsten: ${holders.length} (niet per hoogte)`);

  const trend = sections
    .flatMap((section) => section.groups)
    .find(
      (group) =>
        norm(group.title).includes("trend") &&
        group.swatches.some((swatch) => norm(swatch.name) === "ivoor wit") &&
        group.swatches.some((swatch) => norm(swatch.name) === "mastiek beige"),
    );
  assert.ok(trend);
  for (const excluded of TREND_EXCLUDED) {
    assert.equal(
      trend.swatches.some((swatch) => norm(swatch.name) === norm(excluded) || norm(swatch.name).startsWith(`${norm(excluded)} `)),
      false,
      excluded,
    );
  }
  lines.push(`Trend Kleur: uitzondering, niet toegevoegd: ${TREND_EXCLUDED.join(", ")}`);
  lines.push("Unipanel dakrand: geen kleurenlijst in Fillout, missing n.v.t.");
  console.log(lines.join("\n"));
});

test("vensterbank swatches use the Shopify variant photo", () => {
  const source = staticProducts.find((product) => product.slug === "milinboard-overzetvensterbank-380");
  assert.ok(source);
  const photo = "https://cdn.shopify.com/s/files/vensterbank-wit.jpg";
  const product = {
    ...source,
    variants: source.variants.map((variant) => ({ ...variant, image: { url: photo, alt: variant.colorName } })),
  };
  const swatches = staalPickerSections(applyFillout(buildStaalTree([product])))
    .filter((section) => section.id === "vensterbank")
    .flatMap((section) => section.groups)
    .flatMap((group) => group.swatches);
  assert.ok(swatches.length >= 2);
  assert.ok(swatches.every((swatch) => swatch.image === photo));
});

test("dealflow dry-run returns the payload and does not post", async () => {
  const called: string[] = [];
  const payload = buildDealflowPayload({
    reference: "ST-DRY",
    name: "Jan Test",
    email: "jan@example.com",
    phone: "0612345678",
    postcode: "3454 WZ",
    houseNumber: "6",
    wantsQuote: true,
    dimensions: "12 m2",
    photoName: "gevel.jpg",
    lines: ["VinyPlus Shadow: Turners eiken"],
  });
  const dry = await postDealflow(payload, {
    dryRun: true,
    fetchImpl: (async (url: string | URL | Request) => {
      called.push(String(url));
      throw new Error("geen post");
    }) as typeof fetch,
  });
  assert.equal(dry.ok, true);
  if (!dry.ok || !("payload" in dry)) return;
  assert.equal(called.length, 0);
  assert.equal(dry.payload.submission.submissionId, "ST-DRY");
  assert.equal(dry.payload.submission.questions.find((item) => item.name === "Email")?.value, "jan@example.com");
  assert.equal(dry.payload.submission.questions.find((item) => item.name === "Prijsindicatie")?.value, "ja");
  assert.equal(dry.payload.submission.questions.find((item) => item.name === "Stalen")?.value, "VinyPlus Shadow: Turners eiken");
  assert.equal("contact" in dry.payload, false);
  console.log(JSON.stringify(dry.payload, null, 2));

  const previousUrl = process.env.DEALFLOW_WEBHOOK_URL;
  const previousSecret = process.env.DEALFLOW_WEBHOOK_SECRET;
  delete process.env.DEALFLOW_WEBHOOK_URL;
  delete process.env.DEALFLOW_WEBHOOK_SECRET;
  const missing = await postDealflow(payload);
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.match(missing.error, /DEALFLOW_WEBHOOK_URL, DEALFLOW_WEBHOOK_SECRET/);
  if (previousUrl === undefined) delete process.env.DEALFLOW_WEBHOOK_URL;
  else process.env.DEALFLOW_WEBHOOK_URL = previousUrl;
  if (previousSecret === undefined) delete process.env.DEALFLOW_WEBHOOK_SECRET;
  else process.env.DEALFLOW_WEBHOOK_SECRET = previousSecret;

  const sections = staalPickerSections(applyFillout(buildStaalTree(staticProducts)));
  const swatch = sections.flatMap((section) => section.groups).flatMap((group) => group.swatches).find((item) => item.image);
  assert.ok(swatch);
  resetStaalRateLimit();
  process.env.DEALFLOW_WEBHOOK_URL = "http://127.0.0.1:9/dealflow";
  process.env.DEALFLOW_WEBHOOK_SECRET = "niet-gebruikt";
  const response = await POST(
    new Request("http://kunststof-gevel.test/api/staalaanvraag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dryRun: true,
        companyWebsite: "",
        wantsQuote: false,
        name: "Jan Test",
        email: "jan@example.com",
        phone: "0612345678",
        postcode: "3454 WZ",
        houseNumber: "6",
        dimensions: "8 m2",
        photoName: "gevel.jpg",
        lines: [{ path: swatch.path, colorIds: [swatch.colorId] }],
      }),
    }),
  );
  const body = (await response.json()) as {
    ok: boolean;
    dryRun?: boolean;
    dealflow?: { submission: { questions: { name: string; value: string }[] } };
    missing?: { mail: string[]; activecampaign: string[]; dealflow: string[] };
  };
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.dryRun, true);
  const questions = body.dealflow?.submission.questions ?? [];
  assert.equal(questions.find((item) => item.name === "Afmetingen")?.value, "8 m2");
  assert.match(questions.find((item) => item.name === "Stalen")?.value ?? "", /./);
  assert.equal(questions.find((item) => item.name === "Prijsindicatie")?.value, "nee");
  assert.ok(body.missing);
  console.log(JSON.stringify({ dealflow: body.dealflow, missing: body.missing }, null, 2));
  delete process.env.DEALFLOW_WEBHOOK_URL;
  delete process.env.DEALFLOW_WEBHOOK_SECRET;

  const gaps = [...missingMailEnv(), ...missingActiveCampaignEnv()];
  if (gaps.length) assert.match(leadDeliveryError(), new RegExp(gaps[0]));
});
