"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ColourName, colourOptionText } from "@/components/catalog/colour-name";
import { buttonVariants } from "@/components/ui/button";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import {
  picksToLines,
  sampleFromStaal,
  staalCategoryBlocks,
  staalPickerSections,
  swatchFromSample,
  type StaalPickerGroup,
  type StaalSwatch,
} from "@/lib/staal/picker";
import {
  STAAL_CONTACT_HINT,
  STAAL_HEADING,
  STAAL_INTRO,
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
              Uw stalen {slots.length} van {SAMPLE_LIMIT}
            </p>
            <ul className="mt-1 flex gap-1">
              {Array.from({ length: SAMPLE_LIMIT }, (_, index) => {
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
                    >
                      {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
                    </button>
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
          {slots.length} van {SAMPLE_LIMIT}
        </p>
      </div>
      <ul className="mt-5 grid gap-2">
        {Array.from({ length: SAMPLE_LIMIT }, (_, index) => {
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
              <span className="size-[30px] overflow-hidden border border-[var(--kg-line-dark)]" style={{ background: item.hex || "#C5C1B8" }}>
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
              </span>
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
  paneel,
}: {
  tree: StaalTree;
  groep?: string;
  product?: string;
  paneel?: string;
}) {
  const router = useRouter();
  const sections = useMemo(() => staalPickerSections(tree), [tree]);
  const blocks = useMemo(() => staalCategoryBlocks(sections), [sections]);
  const groups = useMemo(() => blocks.flatMap((block) => block.groups), [blocks]);
  const samples = useSamples();
  const slots = useMemo(() => samples.items.map(swatchFromSample), [samples.items]);
  const [formOpen, setFormOpen] = useState(false);
  const [wantsQuote, setWantsQuote] = useState(false);
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

  const active =
    groups.find((group) => group.id === paneel) ??
    (product ? groups.find((group) => group.swatches.some((swatch) => swatch.productSlugs.includes(product))) : undefined);

  useEffect(() => {
    const target = active
      ? document.getElementById("staal-kleuren")
      : groep
        ? document.getElementById(`staal-cat-${groep}`)
        : null;
    target?.scrollIntoView({ block: "start" });
  }, [active, groep]);

  function openPanel(id: string) {
    const next = new URLSearchParams();
    if (groep) next.set("groep", groep);
    next.set("paneel", id);
    router.push(`/staalaanvraag?${next.toString()}`);
  }

  function backToPanels() {
    router.push(groep ? `/staalaanvraag?groep=${encodeURIComponent(groep)}` : "/staalaanvraag");
  }

  function chosenIn(group: StaalPickerGroup) {
    const ids = new Set(group.swatches.map((swatch) => swatch.id));
    return slots.filter((slot) => ids.has(slot.id)).length;
  }

  function choose(swatch: StaalSwatch) {
    setError("");
    samples.toggle(sampleFromStaal(swatch));
  }

  async function submit() {
    const errors = staalContactErrors(contact);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Vul de verplichte velden in.");
      return;
    }
    const lines = picksToLines(slots.filter((slot) => slot.path.length));
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
          dimensions: "",
          photoName: "",
          photoDataUrl: "",
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "De aanvraag is niet aangekomen.");
        return;
      }
      const win = window as Window & { dataLayer?: Record<string, string>[] };
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: "lead_submit",
        lead_type: "staal_render",
        form_source: "render_staalaanvraag",
      });
      sessionStorage.removeItem(STORAGE_KEY);
      samples.clear();
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
            samples.clear();
            setFormOpen(false);
            setWantsQuote(false);
            setContact(emptyContact());
          }}
          className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
        >
          Nog een aanvraag
        </button>
      </div>
    );
  }

  return (
    <div className={cn("pb-24 lg:pb-0", bannerOpen && "pb-44")}>
      <div className="grid gap-8 lg:grid-cols-[8fr_4fr]">
        <div>
          <h1 className="display-plp max-w-3xl">{STAAL_HEADING}</h1>
          <p className="mt-4 mb-8 max-w-2xl text-[17px] leading-normal text-kg-text-2">{STAAL_INTRO}</p>
          {active ? (
            <div id="staal-kleuren" className="scroll-mt-[calc(var(--kg-chrome)+16px)]">
              <button type="button" onClick={backToPanels} className={buttonVariants({ size: "sm" })}>
                Terug naar paneelsoorten
              </button>
              <h2 className="mt-5 text-[28px] leading-none font-bold tracking-[-0.03em]">{active.title}</h2>
              {active.swatches.flatMap((swatch) => swatch.productSlugs).filter((slug, index, list) => list.indexOf(slug) === index).map((slug) => (
                <span key={slug} id={`staal-product-${slug}`} className="sr-only" />
              ))}
              <div className="mt-5 grid grid-cols-3 gap-x-5 gap-y-3 sm:grid-cols-4">
                {active.swatches.map((swatch) => {
                  const selected = slots.some((slot) => slot.id === swatch.id);
                  const pos = slots.findIndex((slot) => slot.id === swatch.id);
                  const blocked = !selected && slots.length >= SAMPLE_LIMIT;
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
                        {swatch.image ? (
                          <img src={swatch.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : null}
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
          ) : (
            <div className="grid gap-10">
              {blocks.map((block) => (
                <section key={block.sectionId} id={`staal-cat-${block.sectionId}`} className="scroll-mt-[calc(var(--kg-chrome)+16px)]">
                  <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">{block.title}</h2>
                  <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {block.groups.map((group) => {
                      const chosen = chosenIn(group);
                      return (
                        <li key={group.id}>
                          <button
                            type="button"
                            onClick={() => openPanel(group.id)}
                            className="kg-soft-card flex h-full w-full flex-col overflow-hidden text-left"
                          >
                            <span className="flex h-40 items-center justify-center bg-white px-4">
                              {group.image ? (
                                <img src={group.image} alt="" className="max-h-36 w-full object-contain" />
                              ) : null}
                            </span>
                            <span className="flex flex-1 flex-col p-4">
                              <span className="text-[16px] font-medium text-kg-navy">{group.title}</span>
                              <span className="mt-1 font-mono text-[13px] text-kg-text-2">
                                {group.swatches.length} {group.swatches.length === 1 ? "kleur" : "kleuren"}
                              </span>
                              {chosen > 0 ? (
                                <span className="mt-1 font-mono text-[13px] text-kg-navy">
                                  {chosen} {chosen === 1 ? "staal gekozen" : "stalen gekozen"}
                                </span>
                              ) : null}
                              <span className={cn(buttonVariants({ size: "sm" }), "mt-4 w-fit")}>Kleuren</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
        <Tray
          slots={slots}
          onRemove={(id) => samples.remove(id)}
          onAsk={() => {
            setFormOpen(true);
            document.getElementById("staal-formulier")?.scrollIntoView({ block: "start" });
          }}
          className="h-fit max-lg:hidden lg:sticky lg:top-[calc(var(--kg-chrome)+12px)]"
        />
      </div>
      <Tray
        compact
        slots={slots}
        onRemove={(id) => samples.remove(id)}
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
          <label className="mt-6 flex min-h-12 items-center gap-3 border border-kg-lijn bg-white px-3 text-[15px]">
            <input
              type="checkbox"
              name="prijsindicatie"
              checked={wantsQuote}
              onChange={(event) => setWantsQuote(event.target.checked)}
            />
            Ik wil ook een vrijblijvende prijsindicatie
          </label>
          <div className="mt-6 grid gap-4">
            {(
              [
                ["name", "Naam", "name", true],
                ["email", "E-mail", "email", true],
                ["phone", "Telefoon", "tel", false],
                ["postcode", "Postcode", "postal-code", true],
                ["houseNumber", "Huisnummer", "off", true],
              ] as const
            ).map(([key, label, autoComplete, required]) => {
              const fieldError = fieldErrors[key];
              return (
                <label key={key} className="grid gap-1 text-[15px]" htmlFor={`staal-${key}`}>
                  <span>
                    {label}
                    {required ? <span aria-hidden="true"> *</span> : " (optioneel)"}
                  </span>
                  <input
                    id={`staal-${key}`}
                    name={key}
                    type={key === "email" ? "email" : "text"}
                    inputMode={key === "phone" ? "tel" : undefined}
                    autoComplete={autoComplete}
                    required={required}
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
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className={buttonVariants({ variant: "primary" })}>
              {submitting ? "Versturen" : "Staal aanvragen"}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-kg-text-2">Binnen een dag verstuurd. Geen verplichting.</p>
        </form>
      ) : null}
    </div>
  );
}
