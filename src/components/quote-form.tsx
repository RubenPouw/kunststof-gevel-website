"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

import { submitQuote, type QuoteActionState } from "@/app/offerte/actions";
import { buttonVariants } from "@/components/ui/button";
import { useLeadDefaults } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { MONTAGE_PARTS, type MontagePart } from "@/lib/montage-quote";
import { photoError } from "@/lib/quote-photos";
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
  initialParts = [],
  indicativeNote,
  montageExtras = false,
}: {
  idPrefix?: string;
  /** Montage staat aan. De bezoeker kan het uitvinken. */
  defaultMontage?: boolean;
  /** Zonder eigen kader, als het formulier al in een kaart staat. */
  plain?: boolean;
  initialArea?: string;
  initialMessage?: string;
  initialParts?: readonly MontagePart[];
  /** Vaste indicatie uit de winkelwagen. Vervangt de bandbreedte. */
  indicativeNote?: string;
  /** Foto's en de keuze waar het om gaat. Alleen op de montage-offerte. */
  montageExtras?: boolean;
} = {}) {
  const defaults = useLeadDefaults();
  return (
    <QuoteFields
      key={`${idPrefix}-${defaults.email || "gast"}-${defaultMontage ? "montage" : "materiaal"}-${initialArea}-${initialMessage.length}-${initialParts.join(",")}`}
      defaults={defaults}
      idPrefix={idPrefix}
      defaultMontage={defaultMontage}
      plain={plain}
      initialArea={initialArea}
      initialMessage={initialMessage}
      initialParts={initialParts}
      indicativeNote={indicativeNote}
      montageExtras={montageExtras}
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
  initialParts,
  indicativeNote,
  montageExtras,
}: {
  defaults: { name: string; email: string; phone: string };
  idPrefix: string;
  defaultMontage: boolean;
  plain: boolean;
  initialArea: string;
  initialMessage: string;
  initialParts: readonly MontagePart[];
  indicativeNote?: string;
  montageExtras: boolean;
}) {
  const [state, action, pending] = useActionState(submitQuote, initialState);
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [areaM2, setAreaM2] = useState(initialArea);
  const [message, setMessage] = useState(initialMessage);
  const [montage, setMontage] = useState(defaultMontage);
  const [parts, setParts] = useState<MontagePart[]>([...initialParts]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const fieldId = (name: string) => `${idPrefix}-${name}`;

  const area = Number(areaM2.replace(",", "."));
  const liveEstimate = Number.isFinite(area) && area >= 1 ? estimateRange(area, montage) : null;

  function syncPhotos(next: File[]) {
    setPhotos(next);
    const input = photoInput.current;
    if (!input) return;
    const list = new DataTransfer();
    for (const file of next) list.items.add(file);
    input.files = list.files;
  }

  function addPhotos(incoming: File[]) {
    const next = [...photos, ...incoming];
    const problem = photoError(next.map((file) => ({ name: file.name, type: file.type, size: file.size })));
    if (problem) {
      setPhotoMessage(problem);
      syncPhotos(photos);
      return;
    }
    setPhotoMessage(null);
    syncPhotos(next);
  }

  return (
    <form
      action={action}
      autoComplete="off"
      className={plain ? "" : "border border-[var(--color-border)] bg-surface p-6 sm:p-8"}
      onSubmit={(event) => {
        if (montageExtras && parts.length === 0) {
          event.preventDefault();
          setPhotoMessage("Kies waar het om gaat.");
        }
      }}
    >
      {montageExtras ? <input type="hidden" name="montageExtras" value="1" /> : null}
      {parts.map((part) => (
        <input key={part} type="hidden" name="parts" value={part} />
      ))}
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
        {montageExtras ? (
          <div className="sm:col-span-2">
            <fieldset>
              <legend className="text-[13px] font-semibold">Waar gaat het om?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MONTAGE_PARTS.map((part) => {
                  const on = parts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setParts((current) =>
                          current.includes(part) ? current.filter((item) => item !== part) : [...current, part],
                        )
                      }
                      className={cn(
                        "min-h-11 border px-3 text-[14px]",
                        on ? "border-kg-navy bg-kg-navy text-kg-kalk" : "border-kg-lijn bg-white text-kg-navy",
                      )}
                    >
                      {part}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : null}
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
          <Field label={montageExtras ? "Notities" : "Toelichting (optioneel)"} htmlFor={fieldId("message")}>
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
        {montageExtras ? (
          <div className="sm:col-span-2">
            <label htmlFor={fieldId("photos")} className="text-[13px] font-semibold">
              Foto&apos;s toevoegen (optioneel)
            </label>
            <input
              ref={photoInput}
              id={fieldId("photos")}
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              multiple
              className="mt-2 block w-full text-[14px]"
              onChange={(event) => {
                const incoming = event.target.files ? [...event.target.files] : [];
                event.target.value = "";
                addPhotos(incoming);
              }}
            />
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Jpg, png, heic of webp. Hooguit 5 foto&apos;s, 10 MB per stuk.</p>
            {photos.length ? (
              <ul className="mt-3 grid gap-2">
                {photos.map((file) => (
                  <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 border border-kg-lijn px-3 py-2 text-[14px]">
                    <span className="flex min-w-0 items-center gap-3">
                      <PhotoThumb file={file} />
                      <span className="min-w-0 truncate">{file.name}</span>
                    </span>
                    <button
                      type="button"
                      className="shrink-0 font-mono text-[12px] underline"
                      onClick={() => syncPhotos(photos.filter((item) => item !== file))}
                    >
                      Verwijderen
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
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

      {photoMessage ? (
        <p className="mt-4 border border-kg-ink px-4 py-3 text-[14px] text-kg-ink" role="alert">
          {photoMessage}
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

function PhotoThumb({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file.type.startsWith("image/") || /heic|heif/i.test(file.type)) return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  if (!url) return null;
  return <img src={url} alt="" className="size-12 shrink-0 object-cover" />;
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
