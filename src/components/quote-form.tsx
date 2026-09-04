"use client";

import { useActionState, useState } from "react";

import { submitQuote, type QuoteActionState } from "@/app/offerte/actions";
import { buttonVariants } from "@/components/ui/button";
import { estimateRange, quoteProfiles } from "@/lib/quote";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] outline-none focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)]";

const initialState: QuoteActionState = { error: null };

export function QuoteForm() {
  const [state, action, pending] = useActionState(submitQuote, initialState);
  const [areaM2, setAreaM2] = useState("");

  const area = Number(areaM2.replace(",", "."));
  const liveEstimate = Number.isFinite(area) && area >= 1 ? estimateRange(area) : null;

  return (
    <form action={action} autoComplete="off" className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Naam" htmlFor="quote-name">
          <input id="quote-name" name="name" autoComplete="name" required className={fieldClass} />
        </Field>
        <Field label="E-mail" htmlFor="quote-email">
          <input
            id="quote-email"
            name="email"
            type="email"
            autoComplete="email"
            required
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
            onInput={(event) => setAreaM2(event.currentTarget.value)}
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
          Indicatie inclusief montage:{" "}
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
  children: React.ReactNode;
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
