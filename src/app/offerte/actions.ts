"use server";

import { redirect } from "next/navigation";

import { submitQuoteLead } from "@/lib/leads";
import { parseQuoteBody } from "@/lib/quote";

export type QuoteActionState = { error: string | null };

export async function submitQuote(
  _prev: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
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
  });

  if (!input) {
    return { error: "Ongeldige aanvraag." };
  }

  const result = await submitQuoteLead(input);
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
