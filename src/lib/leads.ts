import { syncActiveCampaignContact } from "@/lib/activecampaign";
import { sendLeadEmail } from "@/lib/mail";
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
import { customerStaalText, describeStaalLine, shopStaalText, staalGroupLabel } from "@/lib/staal/messages";
import { resolveStaalLine, type StaalRequest } from "@/lib/staal/validate";
import type { StaalTree } from "@/lib/staal/tree";
import { site } from "@/lib/site";

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

export function leadDeliveryError() {
  return `De aanvraag is niet aangekomen. Bel ${site.phone} of WhatsApp ${site.mobileDisplay}, dan nemen we hem zelf op.`;
}

export async function submitStaalAanvraag(input: StaalRequest, tree: StaalTree): Promise<SampleLeadResult> {
  const described = input.lines.map((line) => {
    const resolved = resolveStaalLine(tree, line);
    if ("error" in resolved) return line.path.join(" / ");
    return describeStaalLine(resolved.node, resolved.colorIds);
  });
  const ref = reference("ST");
  const groups = [...new Set(input.lines.map((line) => staalGroupLabel(tree, line.path)).filter(Boolean))];
  const tags = ["Staalaanvraag", ...groups, input.wantsQuote ? "Prijsindicatie" : ""].filter(Boolean);
  const { firstName, lastName } = splitName(input.name);
  const note = `Staalaanvraag ${ref}. ${described.join("; ")}. ${input.postcode.trim()} ${input.houseNumber.trim()}. Prijsindicatie ${input.wantsQuote ? "ja" : "nee"}.`;
  console.info("[staalaanvraag]", { reference: ref, count: described.length });

  const shopText = shopStaalText({
    reference: ref,
    lines: described,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postcode: input.postcode,
    houseNumber: input.houseNumber,
    wantsQuote: input.wantsQuote,
  });
  const customerText = customerStaalText({
    reference: ref,
    lines: described,
    name: input.name,
    phone: input.phone,
    postcode: input.postcode,
    houseNumber: input.houseNumber,
    wantsQuote: input.wantsQuote,
  });

  const [email, customer, ac] = await Promise.all([
    sendLeadEmail({
      subject: `Staalaanvraag ${ref}`,
      text: shopText,
      replyTo: input.email.trim(),
    }),
    sendLeadEmail({
      to: input.email.trim(),
      replyTo: site.email,
      subject: `Bevestiging staalaanvraag ${ref}`,
      text: customerText,
    }),
    syncActiveCampaignContact({
      email: input.email.trim(),
      firstName,
      lastName,
      phone: input.phone.trim(),
      note,
      tags,
    }),
  ]);

  const emailOk = email.ok && !email.skipped;
  const acOk = ac.ok && !ac.skipped;
  if (!email.ok) console.error("[staalaanvraag] e-mail", email.error);
  if (!customer.ok) console.error("[staalaanvraag] bevestiging", customer.error);
  if (customer.ok && customer.skipped) console.info("[staalaanvraag] bevestiging overgeslagen (geen provider)");
  if (!ac.ok) console.error("[staalaanvraag] ActiveCampaign", ac.error);
  if (email.ok && email.skipped) console.info("[staalaanvraag] e-mail overgeslagen (geen provider)");
  if (ac.ok && ac.skipped) console.info("[staalaanvraag] ActiveCampaign overgeslagen (geen sleutels)");
  if (emailOk || acOk) return { ok: true, reference: ref };
  return { ok: false, error: leadDeliveryError() };
}

async function deliverLead(input: {
  email: string;
  name: string;
  phone: string;
  subject: string;
  text: string;
  note: string;
}) {
  const { firstName, lastName } = splitName(input.name);
  const [email, ac] = await Promise.all([
    sendLeadEmail({
      subject: input.subject,
      text: input.text,
      replyTo: input.email.trim(),
    }),
    syncActiveCampaignContact({
      email: input.email.trim(),
      firstName,
      lastName,
      phone: input.phone.trim(),
      note: input.note,
    }),
  ]);

  const emailOk = email.ok && !email.skipped;
  const acOk = ac.ok && !ac.skipped;
  if (!email.ok) console.error("[leads] e-mail", email.error);
  if (!ac.ok) console.error("[leads] ActiveCampaign", ac.error);
  if (email.ok && email.skipped) console.info("[leads] e-mail overgeslagen (geen provider)");
  if (ac.ok && ac.skipped) console.info("[leads] ActiveCampaign overgeslagen (geen sleutels)");
  if (emailOk || acOk) return null;
  return leadDeliveryError();
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

  const note = `Offerte ${ref}. ${area} m², ${input.profile}, montage ${input.wantsMontage ? "ja" : "nee"}, ${input.city.trim()}. ${input.message.trim()}`;
  console.info("[offerte]", { reference: ref, city: input.city.trim(), areaM2: area });

  const deliveryError = await deliverLead({
    email: input.email,
    name: input.name,
    phone: input.phone,
    subject: `Offerte ${ref}`,
    text: [
      `Nieuwe offerteaanvraag ${ref}`,
      `Naam: ${input.name.trim()}`,
      `E-mail: ${input.email.trim()}`,
      `Telefoon: ${input.phone.trim()}`,
      `Plaats: ${input.city.trim()}`,
      `Oppervlak: ${area} m2`,
      `Profiel: ${input.profile}`,
      `Montage: ${input.wantsMontage ? "ja" : "nee"}`,
      `Bericht: ${input.message.trim() || "-"}`,
    ].join("\n"),
    note,
  });
  if (deliveryError) return { ok: false, error: deliveryError };

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

  const note = `Kleurstalen ${ref}. ${samples.join(", ")}. ${input.address.trim()}, ${input.postcode.trim()} ${input.city.trim()}.`;
  console.info("[stalen]", { reference: ref, count: samples.length });

  const deliveryError = await deliverLead({
    email: input.email,
    name: input.name,
    phone: input.phone,
    subject: `Kleurstalen ${ref}`,
    text: [
      `Nieuwe staalaanvraag ${ref}`,
      `Naam: ${input.name.trim()}`,
      `E-mail: ${input.email.trim()}`,
      `Telefoon: ${input.phone.trim()}`,
      `Adres: ${input.address.trim()}`,
      `Postcode: ${input.postcode.trim()}`,
      `Plaats: ${input.city.trim()}`,
      `Stalen: ${samples.join(", ")}`,
    ].join("\n"),
    note,
  });
  if (deliveryError) return { ok: false, error: deliveryError };

  return { ok: true, reference: ref };
}

export type WithdrawalInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  orderReference: string;
  orderedOn: string;
  receivedOn: string;
  goods: string;
  iban: string;
  companyWebsite: string;
};

export async function submitWithdrawalLead(
  input: WithdrawalInput,
): Promise<{ ok: true; reference: string } | { ok: false; error: string }> {
  if (input.companyWebsite.trim()) return { ok: true, reference: "SKIP" };
  if (input.name.trim().length < 2) return { ok: false, error: "Vul uw naam in." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { ok: false, error: "Vul een geldig e-mailadres in." };
  }
  if (input.goods.trim().length < 3) return { ok: false, error: "Vul in welke goederen u herroept." };

  const ref = reference("KG");
  const error = await deliverLead({
    email: input.email,
    name: input.name,
    phone: input.phone || site.phone,
    subject: `Herroeping ${ref}`,
    text: [
      `Herroeping ${ref}`,
      `Naam: ${input.name.trim()}`,
      `E-mail: ${input.email.trim()}`,
      `Telefoon: ${input.phone.trim() || "-"}`,
      `Adres: ${input.address.trim()}`,
      `Postcode: ${input.postcode.trim()}`,
      `Plaats: ${input.city.trim()}`,
      `Bestelnummer: ${input.orderReference.trim() || "-"}`,
      `Besteld op: ${input.orderedOn.trim() || "-"}`,
      `Ontvangen op: ${input.receivedOn.trim() || "-"}`,
      `Goederen: ${input.goods.trim()}`,
      `IBAN: ${input.iban.trim() || "-"}`,
    ].join("\n"),
    note: `Herroeping ${ref}. ${input.goods.trim()}`,
  });
  if (error) return { ok: false, error };
  return { ok: true, reference: ref };
}
