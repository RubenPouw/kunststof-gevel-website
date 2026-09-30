import { NextResponse } from "next/server";

import { submitSampleLead } from "@/lib/leads";
import { parseSampleBody } from "@/lib/sample-request";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const input = parseSampleBody(body);
  if (!input) {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const result = await submitSampleLead(input);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reference: result.reference });
}
