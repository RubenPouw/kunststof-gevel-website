"use server";

import { redirect } from "next/navigation";

import { parseSampleBody, validateSampleRequest, type SampleActionState } from "@/lib/sample-request";

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
  });

  if (!input) return { error: "Ongeldige aanvraag." };
  const error = validateSampleRequest(input);
  if (error) return { error };

  const reference = `ST-${Date.now().toString(36).toUpperCase()}`;
  console.info("[stalen]", {
    reference,
    name: input.name,
    email: input.email,
    city: input.city,
    samples: input.samples.split("|").filter(Boolean),
  });

  const params = new URLSearchParams({
    ref: reference,
    email: input.email,
    n: String(input.samples.split("|").filter(Boolean).length),
  });
  redirect(`/stalen/bedankt?${params.toString()}`);
}
