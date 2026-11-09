import { missingActiveCampaignEnv } from "@/lib/activecampaign";
import { missingMailEnv } from "@/lib/mail";

/**
 * Omzetdashboard intake at DEALFLOW_WEBHOOK_URL
 * (https://kunststofgevel.onrender.com/api/intake/fillout).
 * That route reads a Fillout submission, not a nested contact.
 * The dashboard itself plans the call after 5 days.
 */

export type DealflowQuestion = { name: string; value: string };

export type DealflowPayload = {
  submission: {
    submissionId: string;
    questions: DealflowQuestion[];
  };
};

export function missingDealflowEnv() {
  const missing: string[] = [];
  if (!process.env.DEALFLOW_WEBHOOK_URL?.trim()) missing.push("DEALFLOW_WEBHOOK_URL");
  if (!process.env.DEALFLOW_WEBHOOK_SECRET?.trim()) missing.push("DEALFLOW_WEBHOOK_SECRET");
  return missing;
}

export function leadDeliveryGaps() {
  return {
    mail: missingMailEnv(),
    activecampaign: missingActiveCampaignEnv(),
    dealflow: missingDealflowEnv(),
  };
}

export function buildDealflowPayload(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  houseNumber: string;
  wantsQuote: boolean;
  dimensions?: string;
  lines: string[];
}): DealflowPayload {
  const questions: DealflowQuestion[] = [
    { name: "Email", value: input.email.trim() },
    { name: "Naam", value: input.name.trim() },
    { name: "Telefoon", value: input.phone.trim() },
    { name: "Postcode", value: input.postcode.trim() },
    { name: "Huisnummer", value: input.houseNumber.trim() },
    { name: "Afmetingen", value: input.dimensions?.trim() ?? "" },
    { name: "Stalen", value: input.lines.join("\n") },
    { name: "Prijsindicatie", value: input.wantsQuote ? "ja" : "nee" },
  ];
  return { submission: { submissionId: input.reference, questions } };
}

function shortDealBody(text: string, secret: string) {
  const hidden = secret ? text.split(secret).join("") : text;
  return hidden.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function postDealflow(
  payload: DealflowPayload,
  options?: { dryRun?: boolean; fetchImpl?: typeof fetch },
) {
  if (options?.dryRun || process.env.DEALFLOW_DRY_RUN === "1") {
    return { ok: true as const, dryRun: true as const, payload };
  }
  const missing = missingDealflowEnv();
  if (missing.length) {
    return {
      ok: false as const,
      error: `De deal is niet aangemaakt. Ontbrekend: ${missing.join(", ")}.`,
    };
  }
  const url = process.env.DEALFLOW_WEBHOOK_URL?.trim() ?? "";
  const secret = process.env.DEALFLOW_WEBHOOK_SECRET?.trim() ?? "";
  try {
    const response = await (options?.fetchImpl ?? fetch)(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
        "x-dealflow-secret": secret,
        "X-Fillout-Secret": secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    const body = await response.text();
    const brief = shortDealBody(body, secret);
    if (!response.ok) {
      console.warn(`[dealflow] failed ${response.status}${brief ? ` ${brief}` : ""}`);
      return { ok: false as const, error: "De deal is niet aangemaakt." };
    }
    console.info(`[dealflow] ok ${response.status}`);
    return { ok: true as const, dryRun: false as const };
  } catch {
    console.warn("[dealflow] failed 0 niet bereikbaar");
    return { ok: false as const, error: "De deal is niet aangemaakt." };
  }
}
