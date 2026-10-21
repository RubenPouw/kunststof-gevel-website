"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import {
  STAAL_BOTH_NOTE,
  STAAL_CONTACT_HINT,
  STAAL_GROUP_QUESTION,
  STAAL_HEADING,
  STAAL_MULTI_NOTE,
  STAAL_PRICE_NO,
  STAAL_PRICE_QUESTION,
  STAAL_PRICE_YES,
  pathForProduct,
  staalSteps,
  type StaalNode,
  type StaalStep,
  type StaalTree,
} from "@/lib/staal/tree";
import { staalContactErrors, type StaalContactKey, type StaalLine } from "@/lib/staal/validate";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kg-staalaanvraag";

type Contact = Record<StaalContactKey, string>;

type SavedLine = {
  groupId: string;
  choiceIds: string[];
  colorIds: string[];
};

type Draft = {
  v: 1;
  groupId: string | null;
  choiceIds: string[];
  colorIds: string[];
  wantsQuote: boolean | null;
  step: number;
  lines: SavedLine[];
  contact: Contact;
};

const emptyContact = (): Contact => ({
  name: "",
  email: "",
  phone: "",
  postcode: "",
  houseNumber: "",
});

let loadedDraft = false;
let storedDraft: Draft | null = null;

function ignoreStore() {
  return () => {};
}

function noStoredDraft() {
  return null;
}

function readStoredDraft() {
  if (loadedDraft) return storedDraft;
  loadedDraft = true;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return storedDraft;
    const parsed = JSON.parse(raw) as Draft;
    storedDraft = parsed?.v === 1 && parsed.contact ? parsed : null;
  } catch {
    storedDraft = null;
  }
  return storedDraft;
}

function freshDraft(tree: StaalTree, groep?: string, product?: string): Draft {
  const base: Draft = {
    v: 1,
    groupId: null,
    choiceIds: [],
    colorIds: [],
    wantsQuote: null,
    step: 0,
    lines: [],
    contact: emptyContact(),
  };
  if (product) {
    const found = pathForProduct(tree, product);
    if (found) {
      const built = staalSteps(tree, { groupId: found.groupId, choiceIds: found.choiceIds, extraLine: false });
      const index = built.steps.findIndex((step) => step.type === "color" || step.type === "price");
      return { ...base, groupId: found.groupId, choiceIds: found.choiceIds, step: index < 0 ? 0 : index };
    }
  }
  if (groep && tree.groups.some((group) => group.id === groep)) {
    return { ...base, groupId: groep };
  }
  return base;
}

function lineSummary(tree: StaalTree, line: SavedLine) {
  const built = staalSteps(tree, { groupId: line.groupId, choiceIds: line.choiceIds, extraLine: true });
  if (!built.leaf) return "";
  if (built.leaf.skipColor) {
    const only = built.leaf.colors[0]?.name;
    return only ? `${built.leaf.label}: ${only}` : built.leaf.label;
  }
  const names = built.leaf.colors.filter((color) => line.colorIds.includes(color.id)).map((color) => color.name);
  return names.length ? `${built.leaf.label}: ${names.join(", ")}` : built.leaf.label;
}

function toPayload(tree: StaalTree, line: SavedLine): StaalLine | null {
  const built = staalSteps(tree, { groupId: line.groupId, choiceIds: line.choiceIds, extraLine: true });
  if (!built.leaf) return null;
  return { path: built.expandedPath, colorIds: built.leaf.skipColor ? [] : line.colorIds };
}

function Picture({ src, hex }: { src?: string; hex?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="block h-28 w-full" style={{ background: hex || "var(--kg-kalk)" }} aria-hidden="true" />;
  }
  return (
    // Catalog photos come from Shopify and are not on the image allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-28 w-full object-contain" onError={() => setFailed(true)} />
  );
}

function ChoiceGrid({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: StaalNode[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer flex-col border-2 bg-white p-3",
              selected ? "border-kg-navy" : "border-kg-lijn",
            )}
          >
            <Picture src={option.image} />
            <span className="mt-3 flex items-start gap-2 text-[15px] leading-snug">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mt-1"
              />
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function StaalWizard({
  tree,
  groep,
  product,
}: {
  tree: StaalTree;
  groep?: string;
  product?: string;
}) {
  const initial = useMemo(() => freshDraft(tree, groep, product), [tree, groep, product]);
  const stored = useSyncExternalStore(ignoreStore, readStoredDraft, noStoredDraft);
  const [draft, setDraft] = useState<Draft>(initial);
  const [resumeChoice, setResumeChoice] = useState<"continue" | "restart" | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<StaalContactKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const skipPersist = useRef(true);
  const askResume = stored !== null && resumeChoice === null;

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (done) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    if (stored && resumeChoice === null) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, done, resumeChoice, stored]);

  const extraLine = draft.lines.length > 0;
  const built = staalSteps(tree, {
    groupId: draft.groupId,
    choiceIds: draft.choiceIds,
    extraLine,
  });
  const stepIndex = Math.min(draft.step, Math.max(built.steps.length - 1, 0));
  const current: StaalStep = built.steps[stepIndex] ?? { type: "group" };
  const progressMax = built.leaf ? built.steps.length : built.steps.length + 2;
  const progress = done ? 100 : Math.round(((stepIndex + 1) / progressMax) * 100);

  function patch(partial: Partial<Draft>) {
    setError("");
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function back() {
    setError("");
    setFieldErrors({});
    setDraft((prev) => ({ ...prev, step: Math.max(0, stepIndex - 1) }));
  }

  function next() {
    if (current.type === "group") {
      if (!draft.groupId) {
        setError("Kies wat u nodig hebt.");
        return;
      }
      patch({ step: stepIndex + 1 });
      return;
    }
    if (current.type === "choose") {
      if (!draft.choiceIds[current.level]) {
        setError("Kies een optie.");
        return;
      }
      patch({ step: stepIndex + 1 });
      return;
    }
    if (current.type === "color") {
      if (!draft.colorIds.length) {
        setError("Kies minstens één kleur.");
        return;
      }
      patch({ step: stepIndex + 1 });
      return;
    }
    if (current.type === "price") {
      if (draft.wantsQuote === null) {
        setError("Kies of u een prijsindicatie wilt.");
        return;
      }
      patch({ step: stepIndex + 1 });
    }
  }

  function currentLine(): SavedLine | null {
    if (!draft.groupId || !built.leaf) return null;
    if (!built.leaf.skipColor && draft.colorIds.length === 0) return null;
    return { groupId: draft.groupId, choiceIds: draft.choiceIds, colorIds: draft.colorIds };
  }

  const pendingLine = current.type === "contact" ? currentLine() : null;

  function contactOk() {
    const errors = staalContactErrors(draft.contact);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function addAnother() {
    const line = currentLine();
    if (!line) {
      setError("Kies eerst een product en minstens één kleur.");
      return;
    }
    if (draft.wantsQuote === null) {
      setError("Kies of u een prijsindicatie wilt.");
      return;
    }
    if (!contactOk()) {
      setError("Vul de verplichte velden in.");
      return;
    }
    if (draft.lines.length >= 7) {
      setError("U kunt maximaal 8 stalen in één aanvraag zetten.");
      return;
    }
    setError("");
    setDraft((prev) => ({
      ...prev,
      lines: [...prev.lines, line],
      groupId: null,
      choiceIds: [],
      colorIds: [],
      step: 0,
    }));
  }

  function removeLine(index: number) {
    setDraft((prev) => ({ ...prev, lines: prev.lines.filter((_, item) => item !== index) }));
  }

  async function submit() {
    const line = currentLine();
    if (!line) {
      setError("Kies eerst een product en minstens één kleur.");
      return;
    }
    if (draft.wantsQuote === null) {
      setError("Kies of u een prijsindicatie wilt.");
      return;
    }
    if (!contactOk()) {
      setError("Vul de verplichte velden in.");
      return;
    }
    const lines = [...draft.lines, line].map((item) => toPayload(tree, item)).filter((item): item is StaalLine => Boolean(item));
    if (!lines.length) {
      setError("Kies een product uit de catalogus.");
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
          wantsQuote: draft.wantsQuote,
          ...draft.contact,
          lines,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "De aanvraag is niet aangekomen.");
        return;
      }
      sessionStorage.removeItem(STORAGE_KEY);
      setDone({ reference: body.reference || "" });
    } catch {
      setError("De aanvraag is niet aangekomen. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    sessionStorage.removeItem(STORAGE_KEY);
    setDone(null);
    setError("");
    setFieldErrors({});
    setResumeChoice("restart");
    setDraft(freshDraft(tree, groep, product));
  }

  const showNote = current.type === "choose" || current.type === "color";
  const showHeading = current.type !== "group";

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div
          className="mb-6 h-1 bg-kg-kalk"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
          aria-label="Voortgang"
        >
          <div className="h-full bg-kg-navy" style={{ width: "100%" }} />
        </div>
        <h1 className="text-[28px] leading-tight font-medium">Bedankt!</h1>
        <p className="mt-4">Je staal wordt binnen een dag verstuurd.</p>
        <p className="mt-2">We sturen je ook direct een mail met bevestiging.</p>
        {done.reference && done.reference !== "SKIP" ? (
          <p className="mt-4 font-mono text-[13px] text-kg-text-2">Referentie {done.reference}</p>
        ) : null}
        <button type="button" onClick={restart} className={cn(buttonVariants({ variant: "primary" }), "mt-8")}>
          Klik hier voor nog een staal aanvraag
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        className="mb-6 h-1 bg-kg-kalk"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={progressMax}
        aria-valuenow={stepIndex + 1}
        aria-label="Voortgang"
      >
        <div className="h-full bg-kg-navy" style={{ width: `${progress}%` }} />
      </div>

      {askResume ? (
        <div className="border border-kg-navy bg-white p-4">
          <p>U hebt een inzending in behandeling. Wilt u doorgaan?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonVariants({ variant: "secondary" })}
              onClick={() => {
                sessionStorage.removeItem(STORAGE_KEY);
                setResumeChoice("restart");
              }}
            >
              Opnieuw beginnen
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "primary" })}
              onClick={() => {
                if (stored) setDraft(stored);
                setResumeChoice("continue");
              }}
            >
              Doorgaan
            </button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (current.type === "contact") void submit();
            else next();
          }}
        >
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </label>
          </div>

          {showHeading ? <h1 className="text-[28px] leading-tight font-medium">{STAAL_HEADING}</h1> : null}
          {showNote ? <p className="mt-3 text-[15px] text-kg-text-2">{STAAL_MULTI_NOTE}</p> : null}
          {current.type === "contact" ? <p className="mt-3 text-[15px]">{STAAL_CONTACT_HINT}</p> : null}

          {current.type === "group" ? (
            <fieldset className="mt-2" aria-labelledby="staal-groep-vraag">
              <h1 id="staal-groep-vraag" className="text-[20px] leading-snug font-medium">
                {STAAL_GROUP_QUESTION}
              </h1>
              <ChoiceGrid
                name="groep"
                options={tree.groups}
                value={draft.groupId ?? ""}
                onChange={(id) => patch({ groupId: id, choiceIds: [], colorIds: [], step: 0 })}
              />
              <p className="mt-4 text-[15px] text-kg-text-2">{STAAL_BOTH_NOTE}</p>
              {draft.lines.length ? (
                <p className="mt-3 text-[15px]">
                  Al gekozen: {draft.lines.map((line) => lineSummary(tree, line)).filter(Boolean).join("; ")}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {current.type === "choose" ? (
            <fieldset className="mt-6">
              <legend className="text-[18px] leading-snug font-medium">{current.question}</legend>
              <ChoiceGrid
                name={`keuze-${current.level}`}
                options={current.options}
                value={draft.choiceIds[current.level] ?? ""}
                onChange={(id) =>
                  patch({
                    choiceIds: [...draft.choiceIds.slice(0, current.level), id],
                    colorIds: [],
                  })
                }
              />
            </fieldset>
          ) : null}

          {current.type === "color" && built.leaf ? (
            <fieldset className="mt-6">
              <legend className="text-[18px] leading-snug font-medium">{current.question}</legend>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {built.leaf.colors.map((color) => {
                  const selected = draft.colorIds.includes(color.id);
                  return (
                    <label
                      key={color.id}
                      className={cn(
                        "flex cursor-pointer flex-col border-2 bg-white p-3",
                        selected ? "border-kg-navy" : "border-kg-lijn",
                      )}
                    >
                      <Picture src={color.image} hex={color.hex} />
                      <span className="mt-3 flex items-start gap-2 text-[15px] leading-snug">
                        <input
                          type="checkbox"
                          name="kleur"
                          value={color.id}
                          checked={selected}
                          onChange={() => {
                            const colorIds = selected
                              ? draft.colorIds.filter((id) => id !== color.id)
                              : [...draft.colorIds, color.id];
                            patch({ colorIds });
                          }}
                          className="mt-1"
                        />
                        {color.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {current.type === "price" ? (
            <fieldset className="mt-6">
              <legend className="text-[18px] leading-snug font-medium">{STAAL_PRICE_QUESTION}</legend>
              <div className="mt-4 grid gap-3">
                {(
                  [
                    [true, STAAL_PRICE_YES],
                    [false, STAAL_PRICE_NO],
                  ] as const
                ).map(([value, label]) => {
                  const selected = draft.wantsQuote === value;
                  return (
                    <label
                      key={label}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center gap-3 border-2 bg-white px-3 text-[15px]",
                        selected ? "border-kg-navy" : "border-kg-lijn",
                      )}
                    >
                      <input
                        type="radio"
                        name="prijs"
                        checked={selected}
                        onChange={() => patch({ wantsQuote: Boolean(value) })}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {current.type === "empty" ? (
            <p className="mt-6 text-[15px]">
              Voor {current.label} staan er nu geen stalen in de catalogus. Bel {site.phone} of WhatsApp {site.mobileDisplay}.
            </p>
          ) : null}

          {current.type === "contact" ? (
            <div className="mt-6 grid gap-4">
              {pendingLine ? (
                <p className="text-[15px]">Deze staal: {lineSummary(tree, pendingLine)}</p>
              ) : null}
              {draft.lines.length ? (
                <div>
                  <p className="font-mono text-[13px] text-kg-text-2">Eerder gekozen</p>
                  <ul className="mt-2 grid gap-2">
                    {draft.lines.map((line, index) => (
                      <li key={`${line.groupId}-${index}`} className="flex items-start justify-between gap-3 text-[15px]">
                        <span>{lineSummary(tree, line)}</span>
                        <button type="button" className="shrink-0 underline" onClick={() => removeLine(index)}>
                          Verwijder
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
                const describedBy = fieldError ? `${key}-fout` : undefined;
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
                      aria-describedby={describedBy}
                      value={draft.contact[key]}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, [key]: event.target.value },
                        }))
                      }
                      className={cn(
                        "h-12 border bg-white px-3",
                        fieldError ? "border-kg-navy" : "border-kg-lijn",
                      )}
                    />
                    {fieldError ? (
                      <span id={describedBy} className="text-[14px]">
                        {fieldError}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 text-[15px]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {stepIndex > 0 ? (
              <button type="button" onClick={back} className={buttonVariants({ variant: "secondary" })}>
                ← Terug
              </button>
            ) : null}
            {current.type === "contact" ? (
              <button type="button" onClick={addAnother} className={buttonVariants({ variant: "secondary" })}>
                Bijbestellen
              </button>
            ) : null}
            {current.type !== "empty" ? (
              <button
                type="submit"
                disabled={submitting}
                className={cn(buttonVariants({ variant: "primary" }), "sm:ml-auto")}
              >
                Volgende
              </button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
