import { buildPdf, measureFormPdfLines } from "@/lib/kozijnen/pdf";
import { clientIp, rateLimitKozijn } from "@/lib/kozijnen/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!rateLimitKozijn(clientIp(request), 20)) {
    return new Response("Te veel aanvragen.", { status: 429 });
  }
  const bytes = buildPdf(measureFormPdfLines());
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"meetformulier-kozijn.pdf\"",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
