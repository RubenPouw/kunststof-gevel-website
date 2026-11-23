import { emptyShowroom, rateLimitShowroom, submitShowroomAppointment, validateShowroom } from "@/lib/showroom";

export const runtime = "nodejs";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "onbekend";
  return request.headers.get("x-real-ip")?.trim() || "onbekend";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function list(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => (typeof item === "string" ? [item] : []));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ ok: false, error: "De aanvraag is onvolledig." }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;
  const input = emptyShowroom({
    name: text(raw.name),
    email: text(raw.email),
    phone: text(raw.phone),
    postcode: text(raw.postcode),
    day: text(raw.day),
    part: text(raw.part),
    interests: list(raw.interests),
    message: text(raw.message),
    includeSamples: raw.includeSamples === true,
    samples: list(raw.samples),
    companyWebsite: text(raw.companyWebsite),
  });

  if (input.companyWebsite.trim()) {
    return Response.json({ ok: true, reference: "SKIP", quiet: true });
  }

  const invalid = validateShowroom(input);
  if (invalid) return Response.json({ ok: false, error: invalid }, { status: 400 });

  if (!rateLimitShowroom(clientIp(request))) {
    return Response.json(
      { ok: false, error: "Te veel aanvragen. Probeer het over een paar minuten opnieuw." },
      { status: 429 },
    );
  }

  const result = await submitShowroomAppointment(input);
  if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 502 });
  return Response.json({ ok: true, reference: result.reference, quiet: result.quiet });
}
