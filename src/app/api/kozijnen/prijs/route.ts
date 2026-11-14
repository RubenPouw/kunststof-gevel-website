import { getLayoutBySlug } from "@/lib/kozijnen/layouts";
import { parseConfig } from "@/lib/kozijnen/model";
import { pricesFlagActive, publicPrice } from "@/lib/kozijnen/prices";
import { priceLayoutConfig } from "@/lib/kozijnen/quote-price";
import { clientIp, rateLimitKozijn } from "@/lib/kozijnen/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimitKozijn(clientIp(request), 30)) {
    return Response.json({ pricesActive: false }, { status: 429 });
  }
  if (!pricesFlagActive()) return Response.json({ pricesActive: false });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ pricesActive: false }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ pricesActive: false }, { status: 400 });
  const raw = body as { layout?: string; query?: string };
  const layout = getLayoutBySlug(String(raw.layout ?? ""));
  if (!layout || typeof raw.query !== "string") return Response.json({ pricesActive: false }, { status: 400 });
  const config = parseConfig(new URLSearchParams(raw.query), layout);
  return Response.json(publicPrice(priceLayoutConfig(layout, config, true)));
}
