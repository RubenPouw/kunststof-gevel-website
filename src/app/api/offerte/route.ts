import { NextResponse } from "next/server";

import { submitQuoteLead } from "@/lib/leads";
import { parseQuoteBody } from "@/lib/quote";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const input = parseQuoteBody(body);
  if (!input) {
    return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const result = await submitQuoteLead(input);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    reference: result.reference,
    estimate: result.estimate,
  });
}
