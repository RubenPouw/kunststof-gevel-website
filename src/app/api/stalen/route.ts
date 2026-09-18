import { NextResponse } from "next/server";

import { parseSampleBody, validateSampleRequest } from "@/lib/sample-request";

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
  const error = validateSampleRequest(input);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  const reference = `ST-${Date.now().toString(36).toUpperCase()}`;
  console.info("[stalen]", { reference, email: input.email, samples: input.samples });
  return NextResponse.json({ ok: true, reference });
}
