import { deliverKozijnQuote, parseQuoteContact } from "@/lib/kozijnen/quote";
import { getLayoutBySlug, layoutPath } from "@/lib/kozijnen/layouts";
import { parseConfig } from "@/lib/kozijnen/model";
import { clientIp, rateLimitKozijn } from "@/lib/kozijnen/rate-limit";

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
  const raw = body as { layout?: string; query?: string };
  const contact = parseQuoteContact(body);
  if (!contact) return Response.json({ ok: false, error: "Controleer naam, e-mail, telefoon en postcode." }, { status: 400 });
  if (contact.companyWebsite.trim()) return Response.json({ ok: true, reference: "SKIP" });

  const layout = getLayoutBySlug(String(raw.layout ?? ""));
  if (!layout || typeof raw.query !== "string") {
    return Response.json({ ok: false, error: "De configuratie is onvolledig." }, { status: 400 });
  }
  if (!rateLimitKozijn(clientIp(request), 5)) {
    return Response.json({ ok: false, error: "Te veel aanvragen. Probeer het over een paar minuten opnieuw." }, { status: 429 });
  }

  const config = parseConfig(new URLSearchParams(raw.query), layout);
  const result = await deliverKozijnQuote(config, contact, `${layoutPath(layout)}?${raw.query}`);
  if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 400 });
  return Response.json({ ok: true, reference: result.reference });
}
