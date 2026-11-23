"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { colourOptionText } from "@/lib/catalog/colours";
import { isBannedSampleText } from "@/lib/staal/banned";
import {
  emptyShowroom,
  parseShowroomDay,
  SHOWROOM_INTERESTS,
  SHOWROOM_PARTS,
  validateShowroom,
} from "@/lib/showroom-form";
import { useSamples } from "@/lib/samples";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] outline-none focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)]";

function sampleLine(item: { brandName?: string; colorName: string }) {
  return [item.brandName, colourOptionText(item.colorName)].filter(Boolean).join(" ");
}

export function AppointmentForm({
  today,
  latest,
  sent,
  reference,
}: {
  today: string;
  latest: string;
  sent: boolean;
  reference: string;
}) {
  const router = useRouter();
  const { items } = useSamples();
  const samples = items.map(sampleLine).filter((line) => line && !isBannedSampleText(line));
  const [includeSamples, setIncludeSamples] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayError, setDayError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    if (!sent && !quiet) return;
    document.getElementById("afspraak")?.scrollIntoView({ block: "start" });
  }, [quiet, sent]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = emptyShowroom({
      name: String(form.get("naam") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("telefoon") ?? ""),
      postcode: String(form.get("postcode") ?? ""),
      day: String(form.get("dag") ?? ""),
      part: String(form.get("dagdeel") ?? ""),
      interests: form.getAll("interesse").flatMap((value) => (typeof value === "string" ? [value] : [])),
      message: String(form.get("opmerking") ?? ""),
      includeSamples: includeSamples && samples.length > 0,
      samples,
      companyWebsite: String(form.get("companyWebsite") ?? ""),
    });
    const problem = validateShowroom(input);
    if (problem) {
      setError(problem);
      setDayError(parseShowroomDay(input.day)?.sunday ? problem : null);
      return;
    }
    setError(null);
    setDayError(null);
    setPending(true);
    try {
      const response = await fetch("/api/showroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; reference?: string; quiet?: boolean };
      if (!response.ok || !data.ok) {
        setError(data.error || "De aanvraag is niet aangekomen.");
        return;
      }
      if (data.quiet || data.reference === "SKIP") {
        setQuiet(true);
        return;
      }
      const query = new URLSearchParams({ verzonden: "1" });
      if (data.reference) query.set("ref", data.reference);
      router.push(`/showroom?${query.toString()}`);
    } catch {
      setError(`De aanvraag is niet aangekomen. Bel ${site.phone} of app ${site.mobileDisplay}.`);
    } finally {
      setPending(false);
    }
  }

  if (sent || quiet) {
    return (
      <div id="afspraak" className="scroll-mt-[calc(var(--kg-chrome)+16px)] border border-kg-navy bg-white p-6 sm:p-8">
        <p className="font-bold text-kg-navy">✓</p>
        <h2 className="mt-4 text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">Uw aanvraag is binnen.</h2>
        <p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-kg-text-2">
          Dit is nog geen bevestigde afspraak. Wij bellen of mailen om de dag vast te leggen.
        </p>
        {reference ? (
          <p className="mt-4 text-[15px]">
            Referentie <span className="font-mono text-[13px]">{reference}</span>.
          </p>
        ) : null}
        <p className="mt-4 text-[15px]">
          Showroom: {site.address}. Alleen op afspraak.
        </p>
        <p className="mt-2 text-[15px]">
          Liever meteen contact? Bel <a href={site.phoneHref}>{site.phone}</a>
          {" of app "}
          <a href={site.whatsapp}>{site.mobileDisplay}</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      id="afspraak"
      onSubmit={onSubmit}
      className="scroll-mt-[calc(var(--kg-chrome)+16px)] border border-kg-lijn bg-white p-6 sm:p-8"
      noValidate
    >
      <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">Vraag een showroomafspraak aan</h2>
      <p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-kg-text-2">
        Dit is een aanvraag. Wij bevestigen de dag per telefoon of e-mail. Tot die bevestiging is er geen vaste afspraak.
      </p>
      <p className="sr-only" aria-hidden>
        <label>
          Website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Voorkeursdag" htmlFor="showroom-dag">
          <input
            id="showroom-dag"
            name="dag"
            type="date"
            required
            min={today}
            max={latest}
            aria-invalid={dayError ? true : undefined}
            className={cn(fieldClass, dayError && "border-kg-navy")}
            onChange={(event) => {
              const parsed = parseShowroomDay(event.target.value);
              setDayError(parsed?.sunday ? "Op zondag plannen we geen showroomafspraak. Kies een andere dag." : null);
            }}
          />
          <p className={cn("text-[13px]", dayError ? "text-kg-navy" : "text-kg-text-2")}>
            {dayError ?? "Geen zondag."}
          </p>
        </Field>

        <fieldset>
          <legend className="text-[13px] font-semibold">Dagdeel</legend>
          <div className="mt-2 flex flex-col gap-2">
            {SHOWROOM_PARTS.map((part) => (
              <label key={part} className="flex min-h-11 items-center gap-3 text-[15px]">
                <input type="radio" name="dagdeel" value={part} required className="size-4 accent-[var(--kg-navy)]" />
                {part}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Naam" htmlFor="showroom-naam">
          <input id="showroom-naam" name="naam" autoComplete="name" required maxLength={80} className={fieldClass} />
        </Field>
        <Field label="E-mail" htmlFor="showroom-email">
          <input
            id="showroom-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={400}
            className={fieldClass}
          />
        </Field>
        <Field label="Telefoon" htmlFor="showroom-telefoon">
          <input
            id="showroom-telefoon"
            name="telefoon"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            className={fieldClass}
          />
        </Field>
        <Field label="Postcode" htmlFor="showroom-postcode">
          <input
            id="showroom-postcode"
            name="postcode"
            autoComplete="postal-code"
            required
            maxLength={7}
            placeholder="1234 AB"
            className={fieldClass}
          />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="text-[13px] font-semibold">Waar wilt u naar kijken?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SHOWROOM_INTERESTS.map((interest) => (
              <label key={interest} className="flex min-h-11 items-center gap-3 text-[15px]">
                <input type="checkbox" name="interesse" value={interest} className="size-4 accent-[var(--kg-navy)]" />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <Field label="Opmerking" htmlFor="showroom-opmerking">
            <textarea
              id="showroom-opmerking"
              name="opmerking"
              rows={4}
              maxLength={2000}
              className={cn(fieldClass, "h-auto min-h-28 py-2")}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          {samples.length ? (
            <>
              <button
                type="button"
                aria-pressed={includeSamples}
                onClick={() => setIncludeSamples((value) => !value)}
                className={cn(buttonVariants({ variant: includeSamples ? "primary" : "secondary", size: "sm" }))}
              >
                {includeSamples ? "Gekozen stalen gaan mee" : "Neem gekozen stalen mee"}
              </button>
              {includeSamples ? (
                <ul className="mt-3 space-y-1 font-mono text-[13px] text-kg-text-2">
                  {samples.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] text-kg-text-2">Gratis stalen. Geen verplichting.</p>
              )}
            </>
          ) : (
            <p className="text-[15px] text-kg-text-2">
              Nog geen stalen gekozen.{" "}
              <Link href="/staalaanvraag">Kies gratis kleurstalen</Link>, dan kunt u ze meesturen.
            </p>
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-4 border border-kg-navy px-4 py-3 text-[14px] text-kg-navy" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
          {pending ? "Verzenden…" : "Aanvraag versturen"}
        </button>
        <p className="text-[13px] text-kg-text-2">
          Je hoort van ons. Geen spam. We gebruiken je gegevens alleen voor deze aanvraag.{" "}
          <Link href="/privacy">Privacy</Link>.
        </p>
      </div>
    </form>
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
