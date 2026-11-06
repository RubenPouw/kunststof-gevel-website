"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ColourName, colourOptionText } from "@/components/catalog/colour-name";
import { SectionHead } from "@/components/brand/section-head";
import { buttonVariants } from "@/components/ui/button";
import {
  addStaalPick,
  picksToLines,
  removeStaalPick,
  STAAL_PICK_LIMIT,
  staalPickerSections,
  type StaalSwatch,
} from "@/lib/staal/picker";
import {
  STAAL_BOTH_NOTE,
  STAAL_CONTACT_HINT,
  STAAL_HEADING,
  STAAL_MULTI_NOTE,
  STAAL_PRICE_NO,
  STAAL_PRICE_QUESTION,
  STAAL_PRICE_YES,
  type StaalTree,
} from "@/lib/staal/tree";
import { staalContactErrors, type StaalContactKey } from "@/lib/staal/validate";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kg-staalaanvraag";

type Contact = Record<StaalContactKey, string>;

const emptyContact = (): Contact => ({
  name: "",
  email: "",
  phone: "",
  postcode: "",
  houseNumber: "",
});

function Tray({
  slots,
  onRemove,
  onAsk,
  compact = false,
  className,
}: {
  slots: StaalSwatch[];
  onRemove: (id: string) => void;
  onAsk: () => void;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <aside className={cn("bg-kg-navy px-3 py-2 text-kg-kalk", className)}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12px] whitespace-nowrap text-kg-grind">
              Uw stalen {slots.length} van {STAAL_PICK_LIMIT}
            </p>
            <ul className="mt-1 flex gap-1">
              {Array.from({ length: STAAL_PICK_LIMIT }, (_, index) => {
                const item = slots[index];
                if (!item) {
                  return (
                    <li key={`leeg-${index}`}>
                      <span className="block size-8 bg-[var(--kg-line-dark)]" aria-label={`Staal ${index + 1}, kies een kleur`} />
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="block size-8 border border-[var(--kg-line-dark)]"
                      style={{ background: item.hex || "#C5C1B8" }}
                      aria-label={`${colourOptionText(item.name)} verwijderen`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            type="button"
            onClick={onAsk}
            disabled={slots.length === 0}
            className="h-11 shrink-0 bg-kg-signal px-3 text-[14px] font-medium text-kg-navy disabled:opacity-45"
          >
            Stalen aanvragen
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn("bg-kg-navy p-6 text-kg-kalk", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Uw stalen</h2>
        <p className="font-mono text-[13px] text-kg-grind">
          {slots.length} van {STAAL_PICK_LIMIT}
        </p>
      </div>
      <ul className="mt-5 grid gap-2">
        {Array.from({ length: STAAL_PICK_LIMIT }, (_, index) => {
          const item = slots[index];
          if (!item) {
            return (
              <li key={`leeg-${index}`} className="flex min-h-14 items-center gap-3 bg-kg-navy-2 px-3">
                <span className="size-[30px] bg-[var(--kg-line-dark)]" />
                <span className="font-mono text-[13px] text-kg-grind">
                  Staal {index + 1}
                  <span className="block">kies een kleur</span>
                </span>
              </li>
            );
          }
          return (
            <li key={item.id} className="flex min-h-14 items-center gap-3 bg-kg-navy-2 px-3">
              <span className="size-[30px] border border-[var(--kg-line-dark)]" style={{ background: item.hex || "#C5C1B8" }} />
              <span className="min-w-0 flex-1">
                <ColourName
                  value={item.code ? `${item.name} (${item.code})` : item.name}
                  className="block text-[14px] font-medium text-kg-kalk"
                  codeClassName="font-mono text-[0.85em] text-kg-grind"
                />
                <span className="block font-mono text-[12px] text-kg-grind">{item.lineLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="grid size-11 place-items-center text-[18px] leading-none text-kg-kalk"
                aria-label={`${colourOptionText(item.name)} verwijderen`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAsk}
        disabled={slots.length === 0}
        className="mt-5 flex h-12 w-full items-center justify-center bg-kg-signal text-[15px] font-medium text-kg-navy disabled:opacity-45"
      >
        Stalen aanvragen
      </button>
      <p className="mt-2 font-mono text-[13px] text-kg-grind">Gratis · binnen een dag · geen verplichting</p>
    </aside>
  );
}

export function StaalPicker({
  tree,
  groep,
  product,
}: {
  tree: StaalTree;
  groep?: string;
  product?: string;
}) {
  const sections = useMemo(() => staalPickerSections(tree), [tree]);
  const [slots, setSlots] = useState<StaalSwatch[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [wantsQuote, setWantsQuote] = useState<boolean | null>(null);
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<StaalContactKey, string>>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const bannerOpen = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("kg-consent", onStoreChange);
      return () => window.removeEventListener("kg-consent", onStoreChange);
    },
    () => {
      try {
        const stored = window.localStorage.getItem("kg-consent");
        return stored !== "granted" && stored !== "denied";
      } catch {
        return true;
      }
    },
    () => true,
  );

  useEffect(() => {
    const target = product ? document.getElementById(`staal-product-${product}`) : groep ? document.getElementById(`staal-${groep}`) : null;
    target?.scrollIntoView({ block: "start" });
  }, [groep, product]);

  function choose(swatch: StaalSwatch) {
    setError("");
    setSlots((current) => {
      if (current.some((slot) => slot.id === swatch.id)) return removeStaalPick(current, swatch.id);
      return addStaalPick(current, swatch);
    });
  }

  async function submit() {
    const errors = staalContactErrors(contact);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Vul de verplichte velden in.");
      return;
    }
    if (wantsQuote === null) {
      setError("Kies of u een prijsindicatie wilt.");
      return;
    }
    const lines = picksToLines(slots);
    if (!lines.length) {
      setError("Kies minstens één kleur.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/staalaanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyWebsite: honeypot,
          wantsQuote,
          ...contact,
          lines,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "De aanvraag is niet aangekomen.");
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      setDone(body.reference || "");
    } catch {
      setError("De aanvraag is niet aangekomen. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done !== null) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-[28px] leading-tight font-medium">Bedankt!</h1>
        <p className="mt-4">Je staal wordt binnen een dag verstuurd.</p>
        <p className="mt-2">We sturen je ook direct een mail met bevestiging.</p>
        {done && done !== "SKIP" ? <p className="mt-4 font-mono text-[13px] text-kg-text-2">Referentie {done}</p> : null}
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setSlots([]);
            setFormOpen(false);
            setWantsQuote(null);
            setContact(emptyContact());
          }}
          className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
        >
          Klik hier voor nog een staal aanvraag
        </button>
      </div>
    );
  }

  return (
    <div className={cn("pb-24 lg:pb-0", bannerOpen && "pb-44")}>
      <div className="grid gap-8 lg:grid-cols-[8fr_4fr]">
        <div>
          <SectionHead title="Kies je kleur" aside="Gratis · maximaal 4 stalen" />
          <h1 className="sr-only">{STAAL_HEADING}</h1>
          <p className="mb-2 max-w-[560px] text-kg-text-2">{STAAL_MULTI_NOTE}</p>
          <p className="mb-6 max-w-[560px] text-kg-text-2">{STAAL_BOTH_NOTE}</p>
          <div className="grid gap-8">
            {sections.map((section) => (
              <section key={section.id} id={`staal-${section.id}`} className="scroll-mt-[130px]">
                <h2 className="text-[20px] font-medium">{section.title}</h2>
                {section.groups.map((group) => (
                  <div key={group.id} className="mt-4">
                    {[...new Set(group.swatches.flatMap((swatch) => swatch.productSlugs))].map((slug) => (
                      <span key={slug} id={`staal-product-${slug}`} className="sr-only" />
                    ))}
                    {group.title !== section.title ? (
                      <h3 className="font-mono text-[13px] text-kg-text-2">{group.title}</h3>
                    ) : null}
                    <div className="mt-3 grid grid-cols-3 gap-x-5 gap-y-3 sm:grid-cols-4">
                      {group.swatches.map((swatch) => {
                        const selected = slots.some((slot) => slot.id === swatch.id);
                        const pos = slots.findIndex((slot) => slot.id === swatch.id);
                        const blocked = !selected && slots.length >= STAAL_PICK_LIMIT;
                        const label = swatch.code ? `${swatch.name} (${swatch.code})` : swatch.name;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            onClick={() => choose(swatch)}
                            disabled={blocked}
                            className="relative text-left disabled:opacity-45"
                          >
                            <div
                              className={cn(
                                "relative aspect-square border border-kg-lijn",
                                selected && "outline outline-2 outline-offset-2 outline-kg-navy",
                              )}
                              style={{ background: swatch.hex || "#C5C1B8" }}
                            >
                              {selected ? (
                                <span className="absolute top-1.5 right-1.5 bg-kg-navy px-1.5 py-0.5 font-mono text-[11px] text-kg-signal">
                                  {String(pos + 1).padStart(2, "0")}
                                </span>
                              ) : null}
                            </div>
                            <ColourName value={label} className="mt-2 block text-[15px] font-medium" />
                            <span className="block font-mono text-[12px] text-kg-text-2">{swatch.lineLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
        <Tray
          slots={slots}
          onRemove={(id) => setSlots((current) => removeStaalPick(current, id))}
          onAsk={() => {
            setFormOpen(true);
            document.getElementById("staal-formulier")?.scrollIntoView({ block: "start" });
          }}
          className="h-fit max-lg:hidden lg:sticky lg:top-[130px]"
        />
      </div>
      <Tray
        compact
        slots={slots}
        onRemove={(id) => setSlots((current) => removeStaalPick(current, id))}
        onAsk={() => {
          setFormOpen(true);
          document.getElementById("staal-formulier")?.scrollIntoView({ block: "start" });
        }}
        className={cn("fixed inset-x-0 z-40 pr-24 lg:hidden", bannerOpen ? "bottom-40" : "bottom-0")}
      />

      {formOpen ? (
        <form
          id="staal-formulier"
          className="scroll-mt-[130px] mt-10 max-w-xl"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <h2 className="text-[22px] font-medium">{STAAL_HEADING}</h2>
          <p className="mt-3 text-[15px]">{STAAL_CONTACT_HINT}</p>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
            </label>
          </div>
          <fieldset className="mt-6">
            <legend className="text-[18px] leading-snug font-medium">{STAAL_PRICE_QUESTION}</legend>
            <div className="mt-4 grid gap-3">
              {(
                [
                  [true, STAAL_PRICE_YES],
                  [false, STAAL_PRICE_NO],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={label}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 border-2 bg-white px-3 text-[15px]",
                    wantsQuote === value ? "border-kg-navy" : "border-kg-lijn",
                  )}
                >
                  <input type="radio" name="prijs" checked={wantsQuote === value} onChange={() => setWantsQuote(value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-6 grid gap-4">
            {(
              [
                ["name", "Naam", "name"],
                ["email", "Email", "email"],
                ["phone", "Telefoonnummer", "tel"],
                ["postcode", "Postcode", "postal-code"],
                ["houseNumber", "Huisnummer", "off"],
              ] as const
            ).map(([key, label, autoComplete]) => {
              const fieldError = fieldErrors[key];
              return (
                <label key={key} className="grid gap-1 text-[15px]" htmlFor={`staal-${key}`}>
                  <span>
                    {label} <span aria-hidden="true">*</span>
                  </span>
                  <input
                    id={`staal-${key}`}
                    name={key}
                    type={key === "email" ? "email" : "text"}
                    inputMode={key === "phone" ? "tel" : undefined}
                    autoComplete={autoComplete}
                    required
                    aria-invalid={Boolean(fieldError)}
                    value={contact[key]}
                    onChange={(event) => setContact((prev) => ({ ...prev, [key]: event.target.value }))}
                    className={cn("h-12 border bg-white px-3", fieldError ? "border-kg-navy" : "border-kg-lijn")}
                  />
                  {fieldError ? <span className="text-[14px]">{fieldError}</span> : null}
                </label>
              );
            })}
          </div>
          {error ? (
            <p role="alert" className="mt-4 text-[15px]">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={submitting} className={cn(buttonVariants({ variant: "primary" }), "mt-6")}>
            {submitting ? "Versturen" : "Stalen aanvragen"}
          </button>
          <p className="mt-3 text-[13px] text-kg-text-2">Binnen een dag verstuurd. Geen verplichting.</p>
        </form>
      ) : null}
    </div>
  );
}
