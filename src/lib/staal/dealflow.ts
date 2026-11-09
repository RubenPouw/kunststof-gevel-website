import { missingActiveCampaignEnv } from "@/lib/activecampaign";
import { missingMailEnv } from "@/lib/mail";

/**
 * Omzetdashboard on kunststofgevel.onrender.com.
 * The dashboard source is not in this repository, and its API answers
 * auth_required before it reads a body, so this is the contract the site sends.
 * DEALFLOW_WEBHOOK_URL should point at the dashboard route that creates a deal
 * and starts the existing "call after 5 days" action.
 */

export type DealflowPayload = {
  source: "staalaanvraag";
  reference: string;
  stage: "presentationscheduled";
  followUp: { action: "call"; afterDays: 5 };
  contact: {
    name: string;
    email: string;
    phone: string;
    postcode: string;
    houseNumber: string;
  };
  wantsQuote: boolean;
  dimensions: string;
  photoName: string;
  photoAttached: boolean;
  lines: string[];
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
  photoName?: string;
  lines: string[];
}): DealflowPayload {
  const photoName = input.photoName?.trim() ?? "";
  return {
    source: "staalaanvraag",
    reference: input.reference,
    stage: "presentationscheduled",
    followUp: { action: "call", afterDays: 5 },
    contact: {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      postcode: input.postcode.trim(),
      houseNumber: input.houseNumber.trim(),
    },
    wantsQuote: input.wantsQuote,
    dimensions: input.dimensions?.trim() ?? "",
    photoName,
    photoAttached: Boolean(photoName),
    lines: input.lines,
  };
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
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return { ok: false as const, error: "De deal is niet aangemaakt." };
    }
    return { ok: true as const, dryRun: false as const };
  } catch {
    return { ok: false as const, error: "De deal is niet aangemaakt." };
  }
}
