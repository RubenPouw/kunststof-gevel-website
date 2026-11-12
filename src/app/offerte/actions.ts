"use server";

import { redirect } from "next/navigation";

import { submitQuoteLead } from "@/lib/leads";
import { MONTAGE_PARTS, type MontagePart } from "@/lib/montage-quote";
import { photoError, safePhotoName } from "@/lib/quote-photos";
import { parseQuoteBody } from "@/lib/quote";

export type QuoteActionState = { error: string | null };

export async function submitQuote(
  _prev: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const extras = formData.get("montageExtras") === "1";
  const parts = formData
    .getAll("parts")
    .map((value) => String(value))
    .filter((value): value is MontagePart => (MONTAGE_PARTS as readonly string[]).includes(value));
  if (extras && parts.length === 0) {
    return { error: "Kies waar het om gaat." };
  }

  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const photoProblem = photoError(files.map((file) => ({ name: file.name, type: file.type, size: file.size })));
  if (photoProblem) return { error: photoProblem };

  const input = parseQuoteBody({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    areaM2: String(formData.get("areaM2") ?? ""),
    profile: String(formData.get("profile") ?? "Nog niet zeker"),
    message: String(formData.get("message") ?? ""),
    wantsMontage: formData.get("wantsMontage") === "ja" ? "ja" : "nee",
    companyWebsite: String(formData.get("companyWebsite") ?? ""),
    parts,
  });

  if (!input) {
    return { error: "Ongeldige aanvraag." };
  }

  let attachments;
  try {
    attachments = await Promise.all(
      files.map(async (file) => ({
        filename: safePhotoName(file.name),
        contentType: file.type || "application/octet-stream",
        content: Buffer.from(await file.arrayBuffer()),
      })),
    );
  } catch {
    return { error: "De foto's zijn niet meegekomen. Probeer kleinere bestanden." };
  }

  const result = await submitQuoteLead(input, attachments);
  if (!result.ok) return { error: result.error };

  const params = new URLSearchParams({
    ref: result.reference,
    email: input.email.trim(),
    area: String(result.estimate.area),
    low: String(result.estimate.low),
    high: String(result.estimate.high),
    montage: result.estimate.montage ? "1" : "0",
  });

  redirect(`/offerte/bedankt?${params.toString()}`);
}
