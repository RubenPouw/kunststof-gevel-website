"use server";

import { cookies } from "next/headers";

import { paymentMethodsEnabled } from "@/lib/payments";
import { createShopifyCheckout, type CheckoutLineInput } from "@/lib/shopify/checkout";
import { site } from "@/lib/site";
import { decodeAdsState } from "@/lib/tracking/identity";

export type CheckoutActionState = { error: string | null; checkoutUrl: string | null };

export async function beginCheckout(_prev: CheckoutActionState, formData: FormData): Promise<CheckoutActionState> {
  const pickup = String(formData.get("pickup") ?? "") === "1";
  const business = String(formData.get("customerType") ?? "") === "zakelijk";
  const required = ["name", "email", "phone", ...(pickup ? [] : ["address", "city", "postcode"])] as const;
  if (required.some((key) => String(formData.get(key) ?? "").trim().length < 2)) {
    return { error: "Vul alle velden in. De winkelwagen mag niet leeg zijn.", checkoutUrl: null };
  }
  if (business) {
    const kvk = String(formData.get("kvk") ?? "").replace(/\D/g, "");
    const btw = String(formData.get("btw") ?? "").trim();
    if (kvk.length !== 8) return { error: "Vul een KvK-nummer van 8 cijfers in.", checkoutUrl: null };
    if (!/^NL[0-9]{9}B[0-9]{2}$/i.test(btw.replace(/\s/g, ""))) {
      return { error: "Vul een btw-nummer in, bijvoorbeeld NL123456789B01.", checkoutUrl: null };
    }
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

  const flags = paymentMethodsEnabled();
  const asked = String(formData.get("payment") ?? "checkout");
  const payment =
    asked === "klarna" && flags.klarna
      ? "klarna"
      : asked === "riverty" && flags.riverty
        ? "riverty"
        : asked === "rekening" && business
          ? "rekening"
          : "checkout";

  const result = await createShopifyCheckout({
    lines,
    montage: String(formData.get("montage") ?? "") === "1",
    ads,
    customer: {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: pickup ? site.street : String(formData.get("address") ?? ""),
      postcode: pickup ? site.postalCode : String(formData.get("postcode") ?? ""),
      city: pickup ? site.city : String(formData.get("city") ?? ""),
      company: String(formData.get("company") ?? ""),
      kvk: String(formData.get("kvk") ?? ""),
      btw: String(formData.get("btw") ?? ""),
      reference: String(formData.get("reference") ?? "").slice(0, 40),
      deliveryDate: String(formData.get("deliveryDate") ?? "").slice(0, 10),
      pickup,
      payment,
    },
  });

  if (!result.ok) return { error: result.error, checkoutUrl: null };
  return { error: null, checkoutUrl: result.checkoutUrl };
}
