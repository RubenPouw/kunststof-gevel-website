import { deliverKozijnQuotes, parseQuoteContact } from "@/lib/kozijnen/quote";
import { getLayoutBySlug, layoutPath } from "@/lib/kozijnen/layouts";
import { parseConfig } from "@/lib/kozijnen/model";
import { clientIp, rateLimitKozijn } from "@/lib/kozijnen/rate-limit";
import { settleOfferte } from "@/lib/tracking/business";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }
  const raw = body as { layout?: string; query?: string; items?: { layout?: string; query?: string }[] };
  const contact = parseQuoteContact(body);
  if (!contact) return Response.json({ ok: false, error: "Controleer naam, e-mail, telefoon en postcode." }, { status: 400 });
  if (contact.companyWebsite.trim()) return Response.json({ ok: true, reference: "SKIP" });

  const requested = Array.isArray(raw.items) && raw.items.length
    ? raw.items
    : [{ layout: raw.layout, query: raw.query }];
  const entries = [];
  for (const item of requested) {
    const layout = getLayoutBySlug(String(item.layout ?? ""));
    if (!layout || typeof item.query !== "string") {
      return Response.json({ ok: false, error: "De configuratie is onvolledig." }, { status: 400 });
    }
    entries.push({
      layout,
      config: parseConfig(new URLSearchParams(item.query), layout),
      path: `${layoutPath(layout)}?${item.query}`,
    });
  }
  if (!rateLimitKozijn(clientIp(request), 5)) {
    return Response.json({ ok: false, error: "Te veel aanvragen. Probeer het over een paar minuten opnieuw." }, { status: 429 });
  }

  const result = await deliverKozijnQuotes(
    entries.map((entry) => ({ config: entry.config, path: entry.path })),
    contact,
  );
  if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 400 });
  const first = entries[0];
  await settleOfferte({
    request,
    config: first.config,
    email: contact.email,
    phone: contact.phone,
    layout: first.layout.slug,
    count: entries.length,
    types: entries.map((entry) => entry.layout.slug).join(","),
  });
  return Response.json({ ok: true, reference: result.reference });
}
