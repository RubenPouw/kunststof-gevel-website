"use server";

import { submitWithdrawalLead } from "@/lib/leads";

export type WithdrawalState = { error: string | null; reference: string | null };

export async function submitWithdrawal(_prev: WithdrawalState, formData: FormData): Promise<WithdrawalState> {
  const result = await submitWithdrawalLead({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    postcode: String(formData.get("postcode") ?? ""),
    city: String(formData.get("city") ?? ""),
    orderReference: String(formData.get("orderReference") ?? ""),
    orderedOn: String(formData.get("orderedOn") ?? ""),
    receivedOn: String(formData.get("receivedOn") ?? ""),
    goods: String(formData.get("goods") ?? ""),
    iban: String(formData.get("iban") ?? ""),
    companyWebsite: String(formData.get("companyWebsite") ?? ""),
  });
  if (!result.ok) return { error: result.error, reference: null };
  return { error: null, reference: result.reference };
}
