import { getLayoutBySlug } from "@/lib/kozijnen/layouts";
import { parseConfig } from "@/lib/kozijnen/model";
import { buildPdf, quotePdfLines } from "@/lib/kozijnen/pdf";
import { clientIp, rateLimitKozijn } from "@/lib/kozijnen/rate-limit";
import { summaryLines } from "@/lib/kozijnen/text";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!rateLimitKozijn(clientIp(request), 20)) {
    return new Response("Te veel aanvragen.", { status: 429 });
  }
  const url = new URL(request.url);
  const layout = getLayoutBySlug(url.searchParams.get("layout") ?? "");
  if (!layout) return new Response("Onbekende indeling.", { status: 400 });
  const config = parseConfig(url.searchParams, layout);
  const bytes = buildPdf(quotePdfLines({ title: layout.title, lines: summaryLines(config) }));
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"kozijn-aanvraag.pdf\"",
      "Cache-Control": "private, no-store",
    },
  });
}
