"use server";

import { redirect } from "next/navigation";

import {
  estimateRange,
  parseQuoteBody,
  validateQuote,
} from "@/lib/quote";

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
  });

  if (!input) {
    return { error: "Ongeldige aanvraag." };
  }

  const error = validateQuote(input);
  if (error) {
    return { error };
  }

  const area = Number(input.areaM2.replace(",", "."));
  const estimate = estimateRange(area);
  const reference = `KG-${Date.now().toString(36).toUpperCase()}`;

  console.info("[offerte]", {
    reference,
    name: input.name,
    email: input.email,
    city: input.city,
    areaM2: area,
    profile: input.profile,
  });

  const params = new URLSearchParams({
    ref: reference,
    email: input.email,
    area: String(estimate.area),
    low: String(estimate.low),
    high: String(estimate.high),
  });

  redirect(`/offerte/bedankt?${params.toString()}`);
}
