"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";

import { submitSamples } from "@/app/stalen/actions";
import { SampleTrayCard } from "@/components/samples/sample-tray-card";
import { buttonVariants } from "@/components/ui/button";
import { useLeadDefaults } from "@/lib/account";
import { type SampleActionState } from "@/lib/sample-request";
import { useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] outline-none focus:border-brand";

const initial: SampleActionState = { error: null };

export function SampleRequestForm() {
  const { items, count } = useSamples();
  const defaults = useLeadDefaults();

  if (count === 0) {
    return (
      <div className="border border-[var(--color-border)] bg-surface p-8">
        <p>Uw tray is leeg. Kies eerst maximaal vier kleuren.</p>
        <Link href="/#stalen" className={cn(buttonVariants({ variant: "secondary" }), "mt-6 inline-flex")}>
          Kies kleuren
        </Link>
      </div>
    );
  }

  return (
    <SampleFields
      key={defaults.email || "gast"}
      defaults={defaults}
      payload={items
        .map((item) => `${item.colorName}${item.ral ? ` ${item.ral}` : ""} (${item.brandName})`)
        .join("|")}
    />
  );
}

function SampleFields({
  defaults,
  payload,
}: {
  defaults: { name: string; email: string; phone: string };
  payload: string;
}) {
  const [state, action, pending] = useActionState(submitSamples, initial);
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
        <input type="hidden" name="samples" value={payload} />
        <p className="sr-only" aria-hidden>
          <label>
            Website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Naam" htmlFor="sample-name">
            <input
              id="sample-name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="E-mail" htmlFor="sample-email">
            <input
              id="sample-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Telefoon" htmlFor="sample-phone">
            <input
              id="sample-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Adres" htmlFor="sample-address">
            <input id="sample-address" name="address" autoComplete="street-address" required className={fieldClass} />
          </Field>
          <Field label="Postcode" htmlFor="sample-postcode">
            <input id="sample-postcode" name="postcode" autoComplete="postal-code" required className={fieldClass} />
          </Field>
          <Field label="Plaats" htmlFor="sample-city">
            <input id="sample-city" name="city" autoComplete="address-level2" required className={fieldClass} />
          </Field>
        </div>
        {state.error ? (
          <p className="mt-5 border border-kg-ink px-4 py-3 text-[14px]" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-6")}
        >
          {pending ? "Verzenden…" : "Stalen gratis aanvragen"}
        </button>
        <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
          Binnen 2 werkdagen thuis. U zit nergens aan vast.
        </p>
      </div>
      <SampleTrayCard className="h-fit lg:sticky lg:top-[130px]" />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
