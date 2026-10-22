import { sendLeadEmail } from "@/lib/mail";
import { syncActiveCampaignContact } from "@/lib/activecampaign";
import { site } from "@/lib/site";

import { getLayoutBySlug, layoutPath } from "./layouts";
import { panesFor, type KozijnConfig } from "./model";
import { internalPrice, optionIdsFor, priceBook } from "./prices";
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

function euro(value: number) {
  return `€ ${value.toFixed(2).replace(".", ",")}`;
}

/** Interne regel voor de winkelmail. De klantmail krijgt dit niet. */
export function shopPriceNote(config: KozijnConfig) {
  const sides = [config.frameOut, config.frameIn, config.sashOut, config.sashIn].filter((id) => id === "ral").length;
  if (sides === 0) return "";
  const layout = getLayoutBySlug(config.layout);
  const caveat = [
    "Dit bedrag gaat niet naar de klant. RAL naar keuze blijft op aanvraag.",
    "De opgeslagen regel is één zijde.",
    sides > 1 ? "Meer dan één zijde RAL is niet apart gemeten." : "",
    "Onder 5 stuks bicolor hoort hier nog een toeslag bij. Die toeslag is nog niet bekend.",
  ].filter((line) => line !== "");
  if (!layout) return caveat.join("\n");
  const hasSash = panesFor(layout, config).some((pane) => pane.kind !== "vast");
  const result = internalPrice(
    {
      layout: layout.slug,
      widthMm: config.width,
      heightMm: config.height,
      panes: layout.panes,
      optionIds: optionIdsFor({ ...config, hasSash }),
    },
    priceBook,
  );
  if (!result.pricesActive) {
    return ["De interne berekening is nog niet compleet, omdat een andere optie geen bedrag heeft.", ...caveat].join("\n");
  }
  const ral = result.lines.find((line) => line.id === "kleur.ral");
  return [
    ral ? `Interne regel RAL naar keuze: ${euro(ral.amountExcl)} excl. btw.` : "",
    `Intern totaal: ${euro(result.totalExcl)} excl. btw.`,
    ...caveat,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export async function deliverKozijnQuote(config: KozijnConfig, contact: QuoteContact, path: string) {
  return deliverKozijnQuotes([{ config, path }], contact);
}

export async function deliverKozijnQuotes(
  entries: { config: KozijnConfig; path: string }[],
  contact: QuoteContact,
) {
  const first = entries[0];
  if (!first) return { ok: false as const, error: "De mand is leeg." };
  const config = first.config;
  const layout = getLayoutBySlug(config.layout);
  const ref = quoteReference();
  const spec = entries
    .map((entry, index) => {
      const title = getLayoutBySlug(entry.config.layout)?.title ?? entry.config.layout;
      return [`Kozijn ${index + 1}: ${title}`, summaryText(entry.config), `${site.origin}${entry.path}`].join("\n");
    })
    .join("\n\n");
  const shopSpec = entries
    .map((entry, index) => {
      const title = getLayoutBySlug(entry.config.layout)?.title ?? entry.config.layout;
      const note = shopPriceNote(entry.config);
      return [`Kozijn ${index + 1}: ${title}`, summaryText(entry.config), note, `${site.origin}${entry.path}`]
        .filter((line) => line !== "")
        .join("\n");
    })
    .join("\n\n");
  const link = entries.map((entry) => `${site.origin}${entry.path}`).join("\n");
  const shop = [
    `Kozijnaanvraag ${ref}`,
    `${contact.name}, ${contact.email}, ${contact.phone}, ${contact.postcode}`,
    contact.note ? `Opmerking: ${contact.note}` : "",
    link,
    "",
    shopSpec,
    "",
    "Geen prijs naar de klant. Inkoopbedragen staan niet in deze mail.",
  ]
    .filter((line) => line !== "")
    .join("\n");
  const customer = [
    `Beste ${contact.name},`,
    "",
    `We hebben uw aanvraag voor ${entries.length} ${entries.length === 1 ? "kozijn" : "kozijnen"} ontvangen. Kenmerk ${ref}.`,
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
      note: `Kozijnaanvraag ${ref}. ${entries.length} kozijnen. ${contact.postcode}.`,
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
