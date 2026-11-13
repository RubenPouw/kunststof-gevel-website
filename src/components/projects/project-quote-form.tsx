"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";

import { submitProjectQuote, type ProjectQuoteState } from "@/app/projecten/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  PROJECT_ATTRIBUTION_KEYS,
  PROJECT_HOUSE_PARTS,
  PROJECT_MONTAGE_OPTIONS,
  PROJECT_MONTHS,
  projectQuoteDataLayer,
} from "@/lib/project-quote";
import { readPendingClicks } from "@/lib/tracking/browser";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] outline-none focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)]";

const initialState: ProjectQuoteState = { error: null, quiet: false };

function readAttribution() {
  const params = new URLSearchParams(window.location.search);
  const clicks = readPendingClicks();
  const values: Record<string, string> = {};
  for (const key of PROJECT_ATTRIBUTION_KEYS) {
    const fromClick = key === "gclid" || key === "gbraid" || key === "wbraid" ? clicks[key] : "";
    values[key] = fromClick || params.get(key) || "";
  }
  return values;
}

export function ProjectQuoteForm({
  sent,
  reference,
  merk,
}: {
  sent: boolean;
  reference: string;
  merk: string;
}) {
  const [state, action, pending] = useActionState(submitProjectQuote, initialState);

  return (
    <section
      id="offerte"
      aria-labelledby="offerte-titel"
      className="kg-soft-card scroll-mt-[calc(var(--kg-chrome)+16px)] overflow-hidden"
    >
      <div className="h-1 bg-kg-signal" aria-hidden />
      <div className="p-6 sm:p-8">
        {sent || state.quiet ? (
          <Thanks tracked={sent} reference={reference} />
        ) : (
          <form
            action={action}
            autoComplete="on"
            onSubmit={(event) => {
              const values = readAttribution();
              for (const key of PROJECT_ATTRIBUTION_KEYS) {
                const input = event.currentTarget.elements.namedItem(key);
                if (input instanceof HTMLInputElement) input.value = values[key] ?? "";
              }
            }}
          >
            <h2 id="offerte-titel" className="text-[22px] leading-snug font-medium tracking-[-0.03em] sm:text-[26px]">
              Vul dit in voor een snelle gratis offerte
            </h2>
            <p className="mt-3 max-w-xl text-[16px] leading-normal text-kg-text-2">
              Wij doen ons best om deze binnen 48 uur te behandelen. Cavemen monteert de gevel en de kozijnen.
            </p>
            <p className="sr-only" aria-hidden>
              <label>
                Website
                <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            {merk ? <input type="hidden" name="merk" value={merk} /> : null}
            {PROJECT_ATTRIBUTION_KEYS.map((key) => (
              <input key={key} type="hidden" name={key} defaultValue="" />
            ))}

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <fieldset className="sm:col-span-2">
                <legend className="text-[13px] font-semibold">
                  Wilt u de offerte voor alleen materiaal of met montage?
                </legend>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
                  {PROJECT_MONTAGE_OPTIONS.map((option) => (
                    <label key={option} className="flex min-h-11 items-center gap-3 text-[15px]">
                      <input type="checkbox" name="montage" value={option} className="size-4 accent-[var(--kg-navy)]" />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="E-mail*" htmlFor="offerte-email">
                <input
                  id="offerte-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={400}
                  aria-required="true"
                  className={fieldClass}
                />
              </Field>
              <Field label="Naam onderneming (niet verplicht)" htmlFor="offerte-bedrijf">
                <input
                  id="offerte-bedrijf"
                  name="bedrijfsnaam"
                  autoComplete="organization"
                  maxLength={400}
                  className={fieldClass}
                />
              </Field>
              <Field label="Voornaam" htmlFor="offerte-voornaam">
                <input
                  id="offerte-voornaam"
                  name="voornaam"
                  autoComplete="given-name"
                  maxLength={400}
                  className={fieldClass}
                />
              </Field>
              <Field label="Achternaam" htmlFor="offerte-achternaam">
                <input
                  id="offerte-achternaam"
                  name="achternaam"
                  autoComplete="family-name"
                  maxLength={400}
                  className={fieldClass}
                />
              </Field>
              <Field label="Telefoonnummer" htmlFor="offerte-telefoon">
                <input
                  id="offerte-telefoon"
                  name="telefoon"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  className={fieldClass}
                />
              </Field>
              <Field label="Adres" htmlFor="offerte-adres">
                <input
                  id="offerte-adres"
                  name="adres"
                  autoComplete="street-address"
                  maxLength={400}
                  className={fieldClass}
                />
              </Field>
              <Field label="Plaats" htmlFor="offerte-plaats">
                <input
                  id="offerte-plaats"
                  name="plaats"
                  autoComplete="address-level2"
                  maxLength={400}
                  className={fieldClass}
                />
              </Field>

              <fieldset className="sm:col-span-2">
                <legend className="text-[13px] font-semibold">Deel van het huis</legend>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
                  {PROJECT_HOUSE_PARTS.map((option) => (
                    <label key={option} className="flex min-h-11 items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        name="deel_van_het_huis"
                        value={option}
                        className="size-4 accent-[var(--kg-navy)]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <Field label="Eventueel gewenste maand van uitvoer / levering" htmlFor="offerte-maand">
                  <select id="offerte-maand" name="maand" defaultValue="" className={fieldClass}>
                    <option value="">Selecteer</option>
                    {PROJECT_MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <fieldset className="sm:col-span-2">
                <legend className="text-[13px] font-semibold">Afbeelding huidige situatie</legend>
                <div className="mt-2 grid gap-3">
                  {(["foto1", "foto2", "foto3"] as const).map((name, index) => (
                    <PhotoField key={name} name={name} index={index} />
                  ))}
                </div>
                <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                  Jpg, png, heic of pdf. Hooguit 3 bestanden, 10 MB per stuk.
                </p>
              </fieldset>

              <div className="sm:col-span-2">
                <Field label="Indien bekend afmetingen en wensen" htmlFor="offerte-afmetingen">
                  <textarea
                    id="offerte-afmetingen"
                    name="afmetingen"
                    rows={5}
                    maxLength={2000}
                    className={cn(fieldClass, "h-auto min-h-28 py-2")}
                  />
                </Field>
              </div>
            </div>

            {state.error ? (
              <p className="mt-4 border border-kg-ink px-4 py-3 text-[14px] text-kg-ink" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                {pending ? "Verzenden…" : "Verzenden"}
              </button>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                Geen spam. We gebruiken uw gegevens alleen voor deze aanvraag.{" "}
                <a href="/privacy" className="underline">
                  Privacy
                </a>
                . Liever bellen? <a href={site.phoneHref}>{site.phone}</a>.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Thanks({ tracked, reference }: { tracked: boolean; reference: string }) {
  useEffect(() => {
    const payload = projectQuoteDataLayer(tracked);
    if (!payload) return;
    const key = `kg-lead-submit-${reference || "projecten"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Meten mag de bedanktekst niet tegenhouden.
    }
    const win = window as Window & { dataLayer?: Array<Record<string, string>> };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(payload);
    document.getElementById("offerte")?.scrollIntoView({ block: "start" });
  }, [tracked, reference]);

  return (
    <div>
      <p className="font-bold text-kg-navy">✓</p>
      <h2 id="offerte-titel" className="mt-4 text-[22px] leading-snug font-medium tracking-[-0.03em] sm:text-[26px]">
        Bedankt. Uw offerteaanvraag is binnen.
      </h2>
      <p className="mt-3 max-w-xl text-[16px] leading-normal text-kg-text-2">
        Wij doen ons best om binnen 48 uur te reageren.
        {reference ? (
          <>
            {" "}
            Referentie <span className="font-mono text-[13px] text-kg-navy">{reference}</span>.
          </>
        ) : null}
      </p>
      <p className="mt-4 text-[15px]">
        Liever bellen? <a href={site.phoneHref}>{site.phone}</a>
        {" of WhatsApp "}
        <a href={site.whatsapp}>{site.mobileDisplay}</a>.
      </p>
    </div>
  );
}

function PhotoField({ name, index }: { name: "foto1" | "foto2" | "foto3"; index: number }) {
  const [fileName, setFileName] = useState("");
  return (
    <div>
      <span className="text-[13px] text-kg-text-2">Bestand {index + 1}</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <label htmlFor={`offerte-${name}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "cursor-pointer")}>
          Kies bestand
        </label>
        <span className="text-[14px] text-kg-text-2">{fileName || "Geen bestand gekozen"}</span>
      </div>
      <input
        id={`offerte-${name}`}
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png,.heic,.pdf,image/jpeg,image/png,image/heic,application/pdf"
        className="sr-only"
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
      />
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
