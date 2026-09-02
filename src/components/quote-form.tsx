"use client";

import { useActionState, useState } from "react";

import { submitQuote, type QuoteActionState } from "@/app/offerte/actions";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { estimateRange, quoteProfiles } from "@/lib/quote";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const initialState: QuoteActionState = { error: null };

export function QuoteForm() {
  const [state, action, pending] = useActionState(submitQuote, initialState);
  const [areaM2, setAreaM2] = useState("");

  const area = Number(areaM2.replace(",", "."));
  const liveEstimate = Number.isFinite(area) && area >= 1 ? estimateRange(area) : null;

  return (
    <form
      action={action}
      autoComplete="off"
      className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
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
        <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm">
          Indicatie inclusief montage:{" "}
          <strong>
            €{liveEstimate.low.toLocaleString("nl-NL")} – €
            {liveEstimate.high.toLocaleString("nl-NL")}
          </strong>
        </p>
      ) : null}

      {state.error ? (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
        >
          {pending ? "Verzenden…" : "Aanvraag versturen"}
        </button>
        <p className="text-xs text-muted-foreground">
          Geen spam. We gebruiken je gegevens alleen voor deze aanvraag.
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
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
