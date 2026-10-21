import { sendLeadEmail } from "@/lib/mail";
import { syncActiveCampaignContact } from "@/lib/activecampaign";
import { site } from "@/lib/site";

import { getLayoutBySlug, layoutPath } from "./layouts";
import type { KozijnConfig } from "./model";
import { summaryText } from "./text";

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  note: string;
  companyWebsite: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTCODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

export function parseQuoteContact(body: unknown): QuoteContact | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const name = String(raw.name ?? "").trim();
  const email = String(raw.email ?? "").trim();
  const phone = String(raw.phone ?? "").trim();
  const postcode = String(raw.postcode ?? "").trim();
  const note = String(raw.note ?? "").trim().slice(0, 1000);
  const companyWebsite = String(raw.companyWebsite ?? "");
  if (name.length < 2 || name.length > 80) return null;
  if (!EMAIL.test(email) || email.length > 120) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  if (!POSTCODE.test(postcode)) return null;
  return { name, email, phone, postcode, note, companyWebsite };
}

export function quoteReference() {
  return `KZ-${Date.now().toString(36).toUpperCase()}`;
}

export async function deliverKozijnQuote(config: KozijnConfig, contact: QuoteContact, path: string) {
  const layout = getLayoutBySlug(config.layout);
  const ref = quoteReference();
  const spec = summaryText(config);
  const link = `${site.origin}${path}`;
  const shop = [
    `Kozijnaanvraag ${ref}`,
    `${contact.name}, ${contact.email}, ${contact.phone}, ${contact.postcode}`,
    contact.note ? `Opmerking: ${contact.note}` : "",
    link,
    "",
    spec,
    "",
    "Geen prijs in deze aanvraag. Prijzen staan uit tot de EKO-lijst er is.",
  ]
    .filter((line) => line !== "")
    .join("\n");
  const customer = [
    `Beste ${contact.name},`,
    "",
    `We hebben uw aanvraag voor een ${layout?.title.toLowerCase() ?? "kozijn"} ontvangen. Kenmerk ${ref}.`,
    "Er staat nog geen prijs op. U ontvangt een vrijblijvende offerte.",
    "",
    spec,
    "",
    "Uw configuratie:",
    link,
    "",
    `${site.company}`,
    `${site.phone}`,
  ].join("\n");

  const [email, confirmation, ac] = await Promise.all([
    sendLeadEmail({
      subject: `Kozijnaanvraag ${ref}`,
      text: shop,
      replyTo: contact.email,
    }),
    sendLeadEmail({
      to: contact.email,
      replyTo: site.email,
      subject: `Aanvraag ${ref}`,
      text: customer,
    }),
    syncActiveCampaignContact({
      email: contact.email,
      firstName: contact.name.split(/\s+/)[0] ?? contact.name,
      lastName: contact.name.split(/\s+/).slice(1).join(" "),
      phone: contact.phone,
      note: `Kozijnaanvraag ${ref}. ${layout?.title ?? config.layout}. ${contact.postcode}.`,
      tags: ["Kozijnaanvraag", layout?.title ?? "Kozijn"],
    }),
  ]);

  const emailOk = email.ok && !email.skipped;
  const acOk = ac.ok && !ac.skipped;
  if (!confirmation.ok) console.error("[kozijn] bevestiging", confirmation.error);
  if (!emailOk && !acOk) {
    return {
      ok: false as const,
      error: `De aanvraag is niet aangekomen. Bel ${site.phone} of WhatsApp ${site.mobileDisplay}.`,
    };
  }
  return { ok: true as const, reference: ref, path: layoutPath({ group: layout?.group ?? "ramen", slug: config.layout }) };
}
