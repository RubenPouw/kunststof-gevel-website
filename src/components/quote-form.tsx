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

export function QuoteForm({
  idPrefix = "quote",
  defaultMontage = true,
  plain = false,
  initialArea = "",
  initialMessage = "",
  indicativeNote,
}: {
  idPrefix?: string;
  /** Montage staat aan. De bezoeker kan het uitvinken. */
  defaultMontage?: boolean;
  /** Zonder eigen kader, als het formulier al in een kaart staat. */
  plain?: boolean;
  initialArea?: string;
  initialMessage?: string;
  /** Vaste indicatie uit de winkelwagen. Vervangt de bandbreedte. */
  indicativeNote?: string;
} = {}) {
  const defaults = useLeadDefaults();
  return (
    <QuoteFields
      key={`${idPrefix}-${defaults.email || "gast"}-${defaultMontage ? "montage" : "materiaal"}-${initialArea}`}
      defaults={defaults}
      idPrefix={idPrefix}
      defaultMontage={defaultMontage}
      plain={plain}
      initialArea={initialArea}
      initialMessage={initialMessage}
      indicativeNote={indicativeNote}
    />
  );
}

function QuoteFields({
  defaults,
  idPrefix,
  defaultMontage,
  plain,
  initialArea,
  initialMessage,
  indicativeNote,
}: {
  defaults: { name: string; email: string; phone: string };
  idPrefix: string;
  defaultMontage: boolean;
  plain: boolean;
  initialArea: string;
  initialMessage: string;
  indicativeNote?: string;
}) {
  const [state, action, pending] = useActionState(submitQuote, initialState);
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [areaM2, setAreaM2] = useState(initialArea);
  const [message, setMessage] = useState(initialMessage);
  const [montage, setMontage] = useState(defaultMontage);
  const fieldId = (name: string) => `${idPrefix}-${name}`;

  const area = Number(areaM2.replace(",", "."));
  const liveEstimate = Number.isFinite(area) && area >= 1 ? estimateRange(area, montage) : null;

  return (
    <form
      action={action}
      autoComplete="off"
      className={plain ? "" : "border border-[var(--color-border)] bg-surface p-6 sm:p-8"}
    >
      <p className="sr-only" aria-hidden>
        <label>
          Website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Naam" htmlFor={fieldId("name")}>
          <input
            id={fieldId("name")}
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="E-mail" htmlFor={fieldId("email")}>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Telefoon" htmlFor={fieldId("phone")}>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Plaats" htmlFor={fieldId("city")}>
          <input
            id={fieldId("city")}
            name="city"
            autoComplete="address-level2"
            required
            className={fieldClass}
          />
        </Field>
        <Field label="Oppervlak (m²)" htmlFor={fieldId("area")}>
          <input
            id={fieldId("area")}
            name="areaM2"
            inputMode="decimal"
            required
            placeholder="bijv. 80"
            className={fieldClass}
            value={areaM2}
            onChange={(event) => setAreaM2(event.target.value)}
          />
        </Field>
        <Field label="Profiel" htmlFor={fieldId("profile")}>
          <select id={fieldId("profile")} name="profile" defaultValue="Nog niet zeker" className={fieldClass}>
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
              Inclusief montage in de offerte
              <span className="mt-1 block text-[13px] text-[var(--color-text-muted)]">
                {indicativeNote
                  ? "Uitvinken als u alleen materiaal wilt."
                  : "Uitvinken als u alleen materiaal wilt. De bandbreedte past mee."}
              </span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <Field label="Toelichting (optioneel)" htmlFor={fieldId("message")}>
            <textarea
              id={fieldId("message")}
              name="message"
              rows={message.includes("\n") ? 10 : 4}
              placeholder="Foto's, bestaande gevel, gewenste kleur…"
              className={cn(fieldClass, "h-auto min-h-24 py-2")}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </Field>
        </div>
      </div>

      {indicativeNote ? (
        <p className="mt-5 bg-kg-kalk px-4 py-3 text-[14px] text-kg-navy">{indicativeNote}</p>
      ) : liveEstimate ? (
        <p className="mt-5 bg-kg-offwhite px-4 py-3 text-[14px]">
          Indicatie {liveEstimate.montage ? "inclusief montage" : "materiaal"}:{" "}
          <strong className="font-heading text-[22px] font-bold">
            {formatPrice(liveEstimate.low)} tot {formatPrice(liveEstimate.high)}
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
