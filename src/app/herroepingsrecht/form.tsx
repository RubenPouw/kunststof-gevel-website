"use client";

import { useActionState } from "react";

import { submitWithdrawal } from "@/app/herroepingsrecht/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal text-kg-navy outline-none focus:border-kg-navy";

export function WithdrawalForm() {
  const [state, action, pending] = useActionState(submitWithdrawal, { error: null, reference: null });

  if (state.reference) {
    return (
      <p className="mt-6 border border-kg-navy bg-white px-4 py-3 text-kg-navy" role="status">
        Herroeping {state.reference} is ontvangen. We mailen u de vervolgstap. Dit is nog geen terugbetaling.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 grid gap-4 bg-kg-offwhite p-5 sm:grid-cols-2">
      <p className="sr-only" aria-hidden>
        <label>
          Website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <Field label="Naam" name="name" autoComplete="name" />
      <Field label="E-mail" name="email" type="email" autoComplete="email" />
      <Field label="Telefoon" name="phone" type="tel" autoComplete="tel" required={false} />
      <Field label="Adres" name="address" autoComplete="street-address" />
      <Field label="Postcode" name="postcode" autoComplete="postal-code" />
      <Field label="Plaats" name="city" autoComplete="address-level2" />
      <Field label="Bestelnummer" name="orderReference" required={false} />
      <Field label="Besteld op" name="orderedOn" required={false} />
      <Field label="Ontvangen op" name="receivedOn" required={false} />
      <Field label="IBAN voor terugbetaling" name="iban" autoComplete="off" required={false} />
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-kg-navy sm:col-span-2">
        Welke goederen
        <textarea name="goods" required rows={4} className={cn(fieldClass, "min-h-24 py-2")} />
      </label>
      {state.error ? (
        <p className="border border-kg-navy px-4 py-3 text-[14px] text-kg-navy sm:col-span-2" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary" }), "sm:col-span-2")}>
        {pending ? "Verzenden…" : "Herroeping versturen"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-kg-navy">
      {label}
      <input name={name} type={type} autoComplete={autoComplete} required={required} className={fieldClass} />
    </label>
  );
}
