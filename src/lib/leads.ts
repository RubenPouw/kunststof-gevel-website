import { syncActiveCampaignContact } from "@/lib/activecampaign";
import {
  estimateRange,
  validateQuote,
  type QuoteInput,
  type QuoteResult,
} from "@/lib/quote";
import {
  validateSampleRequest,
  type SampleRequestInput,
} from "@/lib/sample-request";

export type SampleLeadResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function reference(prefix: "KG" | "ST") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

async function pushContact(input: {
  email: string;
  name: string;
  phone: string;
  note: string;
}) {
  const { firstName, lastName } = splitName(input.name);
  const ac = await syncActiveCampaignContact({
    email: input.email.trim(),
    firstName,
    lastName,
    phone: input.phone.trim(),
    note: input.note,
  });
  if (!ac.ok) {
    console.error("[leads] ActiveCampaign", ac.error);
  } else if (ac.skipped) {
    console.info("[leads] ActiveCampaign overgeslagen (geen sleutels)");
  }
}

export async function submitQuoteLead(input: QuoteInput): Promise<QuoteResult> {
  if (input.companyWebsite.trim()) {
    return { ok: true, reference: "SKIP", estimate: estimateRange(1, true) };
  }

  const error = validateQuote(input);
  if (error) return { ok: false, error };

  const area = Number(input.areaM2.replace(",", "."));
  const estimate = estimateRange(area, input.wantsMontage);
  const ref = reference("KG");

  console.info("[offerte]", {
    reference: ref,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    areaM2: area,
    profile: input.profile,
    montage: input.wantsMontage,
    message: input.message.trim().slice(0, 500),
  });

  await pushContact({
    email: input.email,
    name: input.name,
    phone: input.phone,
    note: `Offerte ${ref}. ${area} m², ${input.profile}, montage ${input.wantsMontage ? "ja" : "nee"}, ${input.city.trim()}. ${input.message.trim()}`,
  });

  return { ok: true, reference: ref, estimate };
}

export async function submitSampleLead(input: SampleRequestInput): Promise<SampleLeadResult> {
  if (input.companyWebsite.trim()) {
    return { ok: true, reference: "SKIP" };
  }

  const error = validateSampleRequest(input);
  if (error) return { ok: false, error };

  const samples = input.samples.split("|").map((item) => item.trim()).filter(Boolean);
  const ref = reference("ST");

  console.info("[stalen]", {
    reference: ref,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    postcode: input.postcode.trim(),
    city: input.city.trim(),
    samples,
  });

  await pushContact({
    email: input.email,
    name: input.name,
    phone: input.phone,
    note: `Kleurstalen ${ref}. ${samples.join(", ")}. ${input.address.trim()}, ${input.postcode.trim()} ${input.city.trim()}.`,
  });

  return { ok: true, reference: ref };
}
