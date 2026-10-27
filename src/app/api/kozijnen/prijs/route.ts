import { getLayoutBySlug } from "@/lib/kozijnen/layouts";
import { panesFor, parseConfig, sizeInRange } from "@/lib/kozijnen/model";
import { calculatePrice, optionIdsFor, priceBook, pricesFlagActive, publicPrice } from "@/lib/kozijnen/prices";
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
  if (!sizeInRange(layout, config.width, config.height)) return Response.json({ pricesActive: false });
  const hasSash = panesFor(layout, config).some((pane) => pane.kind !== "vast");
  const result = calculatePrice(
    {
      layout: layout.slug,
      widthMm: config.width,
      heightMm: config.height,
      panes: layout.panes,
      optionIds: optionIdsFor({ ...config, hasSash }),
    },
    priceBook,
    true,
  );
  return Response.json(publicPrice(result));
}
