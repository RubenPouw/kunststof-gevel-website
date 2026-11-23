import { syncActiveCampaignContact } from "@/lib/activecampaign";
import { leadDeliveryError } from "@/lib/leads";
import { sendLeadEmail } from "@/lib/mail";
import { formatProjectPostcode } from "@/lib/project-quote";
import { absoluteUrl } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { buildDealflowPayload, missingDealflowEnv, postDealflow } from "@/lib/staal/dealflow";

import {
  SHOWROOM_DESCRIPTION,
  SHOWROOM_PHOTO,
  SHOWROOM_TAG,
  showroomCustomerText,
  showroomMapHref,
  showroomShopText,
  validateShowroom,
  type ShowroomInput,
} from "@/lib/showroom-form";

export {
  SHOWROOM_DESCRIPTION,
  SHOWROOM_HORIZON_DAYS,
  SHOWROOM_INTERESTS,
  SHOWROOM_PARTS,
  SHOWROOM_PHOTO,
  SHOWROOM_TAG,
  addShowroomDays,
  cleanShowroomReference,
  emptyShowroom,
  parseShowroomDay,
  showroomCustomerText,
  showroomFaqs,
  showroomLinks,
  showroomMapHref,
  showroomShopText,
  showroomToday,
  validateShowroom,
} from "@/lib/showroom-form";
export type { ShowroomInput } from "@/lib/showroom-form";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export function showroomDealflow(input: ShowroomInput, reference: string) {
  const samples = input.includeSamples && input.samples.length ? input.samples : ["geen stalen mee"];
  const payload = buildDealflowPayload({
    reference,
    name: input.name,
    email: input.email,
    phone: input.phone,
    postcode: formatProjectPostcode(input.postcode) || input.postcode,
    houseNumber: "",
    wantsQuote: false,
    dimensions: [input.day, input.part, input.message.trim()].filter(Boolean).join(". "),
    lines: samples,
  });
  payload.submission.questions.push(
    { name: "Bron", value: "Showroomafspraak" },
    { name: "Voorkeursdag", value: input.day },
    { name: "Dagdeel", value: input.part },
    { name: "Interesse", value: input.interests.join(", ") },
    { name: "Opmerking", value: input.message.trim() },
    { name: "Stalen meenemen", value: input.includeSamples ? "ja" : "nee" },
  );
  return payload;
}

export function showroomJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": `${site.origin}/showroom#showroom`,
    name: `Showroom ${site.name}`,
    url: absoluteUrl("/showroom"),
    image: absoluteUrl(SHOWROOM_PHOTO.src),
    telephone: site.phoneE164,
    email: site.email,
    description: SHOWROOM_DESCRIPTION,
    hasMap: showroomMapHref(),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressCountry: "NL",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    parentOrganization: { "@id": `${site.origin}/#organization` },
  };
}

export function rateLimitShowroom(ip: string, now = Date.now()) {
  const key = ip.trim() || "onbekend";
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetShowroomRateLimit() {
  buckets.clear();
}

export async function submitShowroomAppointment(
  input: ShowroomInput,
): Promise<{ ok: true; reference: string; quiet: boolean } | { ok: false; error: string }> {
  if (input.companyWebsite.trim()) return { ok: true, reference: "SKIP", quiet: true };

  const error = validateShowroom(input);
  if (error) return { ok: false, error };

  const reference = `SR-${Date.now().toString(36).toUpperCase()}`;
  const { firstName, lastName } = splitName(input.name);
  const note = [
    `Showroomafspraak ${reference}.`,
    `${input.day} ${input.part}.`,
    `${input.interests.join(", ")}.`,
    `Postcode ${formatProjectPostcode(input.postcode)}.`,
    input.includeSamples && input.samples.length ? `Stalen: ${input.samples.join(", ")}.` : "Geen stalen mee.",
    input.message.trim(),
  ]
    .filter(Boolean)
    .join(" ");
  console.info("[showroom]", { reference, day: input.day, part: input.part });

  const dealflow = showroomDealflow(input, reference);
  const [email, customer, ac] = await Promise.all([
    sendLeadEmail({
      subject: `Showroomafspraak ${reference}`,
      text: showroomShopText(input, reference),
      replyTo: input.email.trim(),
    }),
    sendLeadEmail({
      to: input.email.trim(),
      replyTo: site.email,
      subject: `Aanvraag showroomafspraak ${reference}`,
      text: showroomCustomerText(input, reference),
    }),
    syncActiveCampaignContact({
      email: input.email.trim(),
      firstName,
      lastName,
      phone: input.phone.trim(),
      note,
      tags: [SHOWROOM_TAG],
    }),
  ]);

  if (!email.ok) console.error("[smtp]", email.error);
  else if (email.skipped) console.error("[smtp] winkelmail overgeslagen");
  if (!customer.ok) console.error("[smtp]", customer.error);
  else if (customer.skipped) console.error("[smtp] bevestiging overgeslagen");
  if (!ac.ok) console.warn("[activecampaign] failed", ac.error);
  else if (ac.skipped) console.warn("[activecampaign] skipped");

  const dealMissing = missingDealflowEnv();
  if (dealMissing.length) {
    console.warn(`[dealflow] skipped. Ontbrekend: ${dealMissing.join(", ")}.`);
  } else {
    await postDealflow(dealflow);
  }

  const mailOk = email.ok && !email.skipped && customer.ok && !customer.skipped;
  if (!mailOk) return { ok: false, error: leadDeliveryError() };
  return { ok: true, reference, quiet: false };
}
