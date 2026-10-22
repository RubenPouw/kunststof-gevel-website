"use server";

import { cookies } from "next/headers";

import { createShopifyCheckout, type CheckoutLineInput } from "@/lib/shopify/checkout";
import { decodeAdsState } from "@/lib/tracking/identity";

export type CheckoutActionState = { error: string | null; checkoutUrl: string | null };

export async function beginCheckout(_prev: CheckoutActionState, formData: FormData): Promise<CheckoutActionState> {
  const required = ["name", "email", "phone", "address", "city", "postcode"] as const;
  if (required.some((key) => String(formData.get(key) ?? "").trim().length < 2)) {
    return { error: "Vul alle velden in. De winkelwagen mag niet leeg zijn.", checkoutUrl: null };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.get("email") ?? "").trim())) {
    return { error: "Vul een geldig e-mailadres in.", checkoutUrl: null };
  }

  let lines: CheckoutLineInput[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("lines") ?? "[]")) as CheckoutLineInput[];
    lines = Array.isArray(parsed) ? parsed : [];
  } catch {
    return { error: "De winkelwagen is onleesbaar. Vernieuw de pagina.", checkoutUrl: null };
  }

  const jar = await cookies();
  const granted = jar.get("kg_consent")?.value === "granted";
  const ads = granted ? decodeAdsState(jar.get("kg_ads")?.value) : null;

  const result = await createShopifyCheckout({
    lines,
    montage: String(formData.get("montage") ?? "") === "1",
    ads,
    customer: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      postcode: String(formData.get("postcode") ?? ""),
      city: String(formData.get("city") ?? ""),
      company: String(formData.get("company") ?? ""),
    },
  });

  if (!result.ok) return { error: result.error, checkoutUrl: null };
  return { error: null, checkoutUrl: result.checkoutUrl };
}
