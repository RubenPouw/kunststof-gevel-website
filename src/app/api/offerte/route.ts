import { NextResponse } from "next/server";

import {
  estimateRange,
  parseQuoteBody,
  validateQuote,
} from "@/lib/quote";

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

  const error = validateQuote(input);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const area = Number(input.areaM2.replace(",", "."));
  const reference = `KG-${Date.now().toString(36).toUpperCase()}`;

  console.info("[offerte]", {
    reference,
    name: input.name,
    email: input.email,
    city: input.city,
    areaM2: area,
    profile: input.profile,
  });

  return NextResponse.json({
    ok: true,
    reference,
    estimate: estimateRange(area),
  });
}
