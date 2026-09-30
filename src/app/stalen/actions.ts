"use server";

import { redirect } from "next/navigation";

import { submitSampleLead } from "@/lib/leads";
import { parseSampleBody, type SampleActionState } from "@/lib/sample-request";

export async function submitSamples(
  _prev: SampleActionState,
  formData: FormData,
): Promise<SampleActionState> {
  const input = parseSampleBody({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    postcode: String(formData.get("postcode") ?? ""),
    city: String(formData.get("city") ?? ""),
    samples: String(formData.get("samples") ?? ""),
    companyWebsite: String(formData.get("companyWebsite") ?? ""),
  });

  if (!input) return { error: "Ongeldige aanvraag." };

  const result = await submitSampleLead(input);
  if (!result.ok) return { error: result.error };

  const count = input.samples.split("|").filter(Boolean).length;
  const params = new URLSearchParams({
    ref: result.reference,
    email: input.email.trim(),
    n: String(count),
  });
  redirect(`/stalen/bedankt?${params.toString()}`);
}
