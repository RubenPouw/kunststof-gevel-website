import { getCatalog } from "@/lib/catalog";
import { submitStaalAanvraag } from "@/lib/leads";
import { rateLimitStaal } from "@/lib/staal/rate-limit";
import { buildStaalTree } from "@/lib/staal/tree";
import { parseStaalRequest, validateStaalRequest } from "@/lib/staal/validate";
import { settleStaal } from "@/lib/tracking/business";

export const runtime = "nodejs";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "onbekend";
  return request.headers.get("x-real-ip")?.trim() || "onbekend";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }

  const parsed = parseStaalRequest(body);
  if (!parsed) {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }
  if (parsed.companyWebsite.trim()) {
    return Response.json({ ok: true, reference: "SKIP" });
  }
  if (!rateLimitStaal(clientIp(request))) {
    return Response.json(
      { ok: false, error: "Te veel aanvragen. Probeer het over een paar minuten opnieuw." },
      { status: 429 },
    );
  }

  const catalog = await getCatalog();
  const tree = buildStaalTree(catalog.products);
  const error = validateStaalRequest(parsed, tree);
  if (error) return Response.json({ ok: false, error }, { status: 400 });

  const result = await submitStaalAanvraag(parsed, tree);
  if (result.ok) {
    await settleStaal({ request, count: parsed.lines.length, email: parsed.email, phone: parsed.phone });
  }
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
