"use client";

import { useActionState, useState, type ReactNode } from "react";

import { submitQuote, type QuoteActionState } from "@/app/offerte/actions";
import { buttonVariants } from "@/components/ui/button";
import { useLeadDefaults } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { estimateRange, quoteProfiles } from "@/lib/quote";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] outline-none focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)]";

const initialState: QuoteActionState = { error: null };

export function QuoteForm() {
  const defaults = useLeadDefaults();
  return <QuoteFields key={defaults.email || "gast"} defaults={defaults} />;
}

function QuoteFields({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string };
}) {
  const [state, action, pending] = useActionState(submitQuote, initialState);
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [areaM2, setAreaM2] = useState("");
  const [montage, setMontage] = useState(true);

  const area = Number(areaM2.replace(",", "."));
  const liveEstimate = Number.isFinite(area) && area >= 1 ? estimateRange(area, montage) : null;

  return (
    <form action={action} autoComplete="off" className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
      <p className="sr-only" aria-hidden>
        <label>
          Website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Naam" htmlFor="quote-name">
          <input
            id="quote-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="E-mail" htmlFor="quote-email">
          <input
            id="quote-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Telefoon" htmlFor="quote-phone">
          <input
            id="quote-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Plaats" htmlFor="quote-city">
          <input
            id="quote-city"
            name="city"
            autoComplete="address-level2"
            required
            className={fieldClass}
          />
        </Field>
        <Field label="Oppervlak (m²)" htmlFor="quote-area">
          <input
            id="quote-area"
            name="areaM2"
            inputMode="decimal"
            required
            placeholder="bijv. 80"
            className={fieldClass}
            value={areaM2}
            onChange={(event) => setAreaM2(event.target.value)}
          />
        </Field>
        <Field label="Profiel" htmlFor="quote-profile">
          <select id="quote-profile" name="profile" defaultValue="Nog niet zeker" className={fieldClass}>
            {quoteProfiles.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-[15px]">
            <input
              type="checkbox"
              name="wantsMontage"
              value="ja"
              checked={montage}
              onChange={(event) => setMontage(event.target.checked)}
              className="mt-1 size-4 accent-[var(--kg-navy)]"
            />
            <span>
              Inclusief montage door een Caveman
              <span className="mt-1 block text-[13px] text-[var(--color-text-muted)]">
                Uitvinken als u alleen materiaal wilt. De bandbreedte past mee.
              </span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <Field label="Toelichting (optioneel)" htmlFor="quote-message">
            <textarea
              id="quote-message"
              name="message"
              rows={4}
              placeholder="Foto’s, bestaande gevel, gewenste kleur…"
              className={cn(fieldClass, "h-auto min-h-24 py-2")}
            />
          </Field>
        </div>
      </div>

      {liveEstimate ? (
        <p className="mt-5 bg-kg-offwhite px-4 py-3 text-[14px]">
          Indicatie {liveEstimate.montage ? "inclusief montage" : "materiaal"}:{" "}
          <strong className="font-heading text-[22px] font-bold">
            {formatPrice(liveEstimate.low)} – {formatPrice(liveEstimate.high)}
          </strong>
        </p>
      ) : null}

      {state.error ? (
        <p className="mt-4 border border-kg-ink px-4 py-3 text-[14px] text-kg-ink" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
          {pending ? "Verzenden…" : "Aanvraag versturen"}
        </button>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Geen spam. We gebruiken uw gegevens alleen voor deze aanvraag.
        </p>
      </div>
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
