import { NextResponse } from "next/server";

import { readCookie } from "@/lib/tracking/consent";
import { ADS_COOKIE, CONSENT_COOKIE, consentDecision, trackingCookieOptions } from "@/lib/tracking/cookies";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 2000) {
    return Response.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return Response.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const choice = body && typeof body === "object" && "choice" in body ? (body as { choice?: unknown }).choice : "";
  if (choice !== "granted" && choice !== "denied") {
    return Response.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const clicks = body as { gclid?: unknown; gbraid?: unknown; wbraid?: unknown };
  const decision = consentDecision(choice, {
    existing: readCookie(request.headers.get("cookie"), "kg_ads"),
    clicks,
  });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(CONSENT_COOKIE, decision.consent, trackingCookieOptions());
  if (decision.ads) response.cookies.set(ADS_COOKIE, decision.ads, trackingCookieOptions());
  else response.cookies.set(ADS_COOKIE, "", trackingCookieOptions(0));
  return response;
}
