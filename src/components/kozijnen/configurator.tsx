"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { DetailPhotoCard } from "@/components/kozijnen/detail-photo";
import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnOrderSummary } from "@/components/kozijnen/order-summary";
import { DETAIL_PHOTOS } from "@/lib/kozijnen/detail-photos";
import { buttonVariants } from "@/components/ui/button";
import { FRAME_COLORS, LAMINATED, LOW_GLASS, publicProfileName } from "@/lib/kozijnen/config";
import { layoutPath, layoutsIn, type Layout } from "@/lib/kozijnen/layouts";
import { VatPrice } from "@/components/brand/vat-price";
import { addBasketItem, readBasket, writeBasket } from "@/lib/kozijnen/basket";
import {
  FLOW,
  KOZIJN_STORAGE_KEY,
  STEPS,
  applyLaminatedDefault,
  colorLabel,
  defaultConfig,
  flowForStep,
  hasConfigParams,
  parseConfig,
  resumeVisible,
  serializeConfig,
  sizeInRange,
  type KozijnConfig,
  type StepId,
} from "@/lib/kozijnen/model";
import { summaryLines } from "@/lib/kozijnen/text";
import { site } from "@/lib/site";
import { browserConsent, trackBrowserEvent } from "@/lib/tracking/browser";
import { cn } from "@/lib/utils";

type PriceResponse =
  | { pricesActive: false }
  | { pricesActive: true; lines: { id: string; label: string; amountExcl: number }[]; totalExcl: number; totalIncl: number };

const choiceGrid = "grid grid-cols-1 gap-6 sm:grid-cols-2";

export function KozijnConfigurator({ layout, pricesActive }: { layout: Layout; pricesActive: boolean }) {
  const init = useRef<string | null>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<KozijnConfig>(() => defaultConfig(layout));
  const [ready, setReady] = useState(false);
  const [askResume, setAskResume] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [basketNote, setBasketNote] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (init.current === layout.slug) return;
    init.current = layout.slug;
    const query = new URLSearchParams(window.location.search);
    queueMicrotask(() => {
      if (hasConfigParams(query)) {
        setConfig(parseConfig(query, layout));
        setAskResume(false);
        setReady(true);
        return;
      }
      try {
        const raw = window.localStorage.getItem(KOZIJN_STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as { layout?: string; query?: string };
          if (stored.layout === layout.slug && stored.query) {
            setPending(stored.query);
            setAskResume(true);
          }
        }
      } catch {
        window.localStorage.removeItem(KOZIJN_STORAGE_KEY);
      }
      setReady(true);
    });
  }, [layout]);

  useEffect(() => {
    if (!ready || askResume) return;
    const query = serializeConfig(config);
    window.localStorage.setItem(KOZIJN_STORAGE_KEY, JSON.stringify({ layout: layout.slug, query }));
    const next = `${layoutPath(layout)}?${query}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [askResume, config, layout, ready]);

  useEffect(() => {
    if (!pricesActive) return;
    const controller = new AbortController();
    const query = serializeConfig(config);
    void fetch("/api/kozijnen/prijs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: layout.slug, query }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { pricesActive: false }))
      .then((body: PriceResponse) => setPrice(body))
      .catch(() => setPrice({ pricesActive: false }));
    return () => controller.abort();
  }, [config, layout.slug, pricesActive]);

  useEffect(() => {
    if (!ready) return;
    function once(key: string) {
      try {
        if (window.sessionStorage.getItem(key)) return false;
        window.sessionStorage.setItem(key, "1");
        return true;
      } catch {
        return true;
      }
    }
    function sendStart() {
      if (browserConsent() !== "granted" || !once(`kg-track-start:${layout.slug}`)) return;
      trackBrowserEvent("configurator_gestart", { type: layout.slug });
    }
    function sendDone() {
      if (config.step !== "overzicht" || browserConsent() !== "granted") return;
      if (pricesActive && price === null) return;
      if (!once(`kg-track-done:${layout.slug}`)) return;
      const waarde = price && "totalExcl" in price ? price.totalExcl : undefined;
      trackBrowserEvent("configurator_afgerond", {
        type: layout.slug,
        ...(waarde == null ? {} : { waarde_excl: waarde }),
      });
    }
    sendStart();
    sendDone();
    window.addEventListener("kg-consent", sendStart);
    window.addEventListener("kg-consent", sendDone);
    return () => {
      window.removeEventListener("kg-consent", sendStart);
      window.removeEventListener("kg-consent", sendDone);
    };
  }, [config.step, layout.slug, price, pricesActive, ready]);

  const flow = flowForStep(config.step);
  const flowIndex = Math.max(0, FLOW.findIndex((item) => item.id === flow.id));
  const meta = STEPS.find((step) => step.id === flow.steps[0]) ?? STEPS[0];
  const inRange = sizeInRange(layout, config.width, config.height);
  const lines = useMemo(() => summaryLines(config), [config]);
  const pdfHref = `/api/kozijnen/pdf?layout=${encodeURIComponent(layout.slug)}&${serializeConfig(config)}`;
  const share = `${site.origin}${layoutPath(layout)}?${serializeConfig(config)}`;
  const shownPrice = pricesActive ? price : { pricesActive: false as const };

  function patch(partial: Partial<KozijnConfig>) {
    setConfig((current) => applyLaminatedDefault({ ...current, ...partial }, layout));
  }

  function go(next: StepId) {
    if (next !== FLOW[0].steps[0]) setAskResume(false);
    patch({ step: next });
    queueMicrotask(() => focusRef.current?.scrollIntoView({ block: "start" }));
  }

  function resume(continueDraft: boolean) {
    if (continueDraft && pending) setConfig(parseConfig(new URLSearchParams(pending), layout));
    else {
      window.localStorage.removeItem(KOZIJN_STORAGE_KEY);
      setConfig(defaultConfig(layout));
    }
    setAskResume(false);
  }

  async function onQuote(form: FormData) {
    setFormError(null);
    setSending(true);
    try {
      const response = await fetch("/api/kozijnen/offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layout: layout.slug,
          query: serializeConfig(config),
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          postcode: String(form.get("postcode") ?? ""),
          note: String(form.get("note") ?? ""),
          companyWebsite: String(form.get("companyWebsite") ?? ""),
        }),
      });
      const body = (await response.json()) as { ok?: boolean; reference?: string; error?: string };
      if (!response.ok || !body.ok || !body.reference) {
        setFormError(body.error || "De aanvraag is niet verstuurd.");
        return;
      }
      setSent(body.reference);
    } catch {
      setFormError("De aanvraag is niet verstuurd. Probeer het opnieuw.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-kg pb-28 lg:pb-16">
      {resumeVisible(config.step, askResume) ? (
        <div className="mb-8 border border-kg-navy bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Je was al bezig met een kozijn. Verder gaan of opnieuw beginnen?</p>
            <button type="button" className="grid size-11 shrink-0 place-items-center" onClick={() => setAskResume(false)} aria-label="Melding sluiten">
              ×
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={buttonVariants({ size: "sm" })} onClick={() => resume(true)}>
              Verder gaan
            </button>
            <button type="button" className={buttonVariants({ variant: "secondary", size: "sm" })} onClick={() => resume(false)}>
              Opnieuw beginnen
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-12">
        <div>
          <nav aria-label="Stappen" className="overflow-x-auto lg:overflow-visible">
            <ol className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
              {FLOW.map((item, index) => {
                const current = item.id === flow.id;
                const done = index < flowIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(item.steps[0])}
                      aria-current={current ? "step" : undefined}
                      className={cn(
                        "flex h-11 items-center gap-2 border-2 px-3 text-[14px]",
                        current ? "border-kg-navy bg-kg-navy text-white" : done ? "border-kg-navy bg-white text-kg-navy" : "border-kg-lijn bg-white text-kg-text-2",
                      )}
                    >
                      <span className="font-mono text-[13px]">{index + 1}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {flowIndex > 0 ? (
            <ol className="mt-8 divide-y divide-kg-lijn border-y border-kg-lijn">
              {FLOW.slice(0, flowIndex).map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <p className="min-w-0">
                    <span className="font-mono text-[13px] text-kg-text-2">{index + 1}</span>
                    <span className="ml-3 font-medium">{item.label}</span>
                    <span className="mt-1 block truncate text-[14px] text-kg-text-2 sm:mt-0 sm:ml-3 sm:inline">{flowSummary(item.id, layout, config)}</span>
                  </p>
                  <button
                    type="button"
                    className="shrink-0 text-[14px] underline underline-offset-[3px]"
                    aria-label={`Wijzig ${item.label}`}
                    onClick={() => go(item.steps[0])}
                  >
                    wijzig
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          <div ref={focusRef} id="kozijn-stap" data-flow={flow.id} className="scroll-mt-28 mt-8">
            <p className="font-mono text-[13px] text-kg-text-2">
              Stap {flowIndex + 1} van {FLOW.length}
            </p>
            <h2 className="mt-2">{flow.label}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-normal text-kg-text-2">
              {meta.hint}{" "}
              <Link href={`/kunststof-kozijnen/kennisbank/${meta.article}`}>Uitleg over {flow.label.toLowerCase()}</Link>
            </p>

            <div className="mt-8">
              {flow.id === "type" ? <TypeStep layout={layout} config={config} onChange={patch} /> : null}
              {flow.id === "maten" ? <SizeStep layout={layout} config={config} inRange={inRange} onChange={patch} /> : null}
              {flow.id === "profiel" ? (
                <div className="space-y-12">
                  <CornerStep layout={layout} config={config} onChange={patch} />
                  <SillStep config={config} onChange={patch} />
                </div>
              ) : null}
              {flow.id === "kleur" ? <ColorStep layout={layout} config={config} onChange={patch} /> : null}
              {flow.id === "glas" ? <GlassStep config={config} onChange={patch} /> : null}
              {flow.id === "beslag" ? (
                <div className="space-y-12">
                  <HardwareStep config={config} onChange={patch} />
                  <ExtraStep layout={layout} config={config} onChange={patch} />
                </div>
              ) : null}
              {flow.id === "ventilatie" ? <VentStep config={config} onChange={patch} /> : null}
              {flow.id === "overzicht" ? (
                <Overview
                  lines={lines}
                  pdfHref={pdfHref}
                  share={share}
                  price={shownPrice}
                  sent={sent}
                  error={formError}
                  sending={sending}
                  onQuote={onQuote}
                  onBasket={() => {
                    const next = addBasketItem(readBasket(), {
                      layout: layout.slug,
                      query: serializeConfig(config),
                      title: `${layout.title} ${config.width} × ${config.height} mm`,
                    });
                    writeBasket(next);
                    setBasketNote(`${next.length} ${next.length === 1 ? "kozijn" : "kozijnen"} in de offertemand.`);
                  }}
                />
              ) : null}
            </div>
          </div>

          {flow.id !== "overzicht" ? (
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonVariants({ variant: "secondary" })}
                disabled={flowIndex === 0}
                onClick={() => go(FLOW[flowIndex - 1].steps[0])}
              >
                Terug
              </button>
              <button type="button" className={buttonVariants()} onClick={() => go(FLOW[flowIndex + 1].steps[0])}>
                Volgende
              </button>
            </div>
          ) : (
            <div className="mt-10">
              <button type="button" className={buttonVariants({ variant: "secondary" })} onClick={() => go(FLOW[flowIndex - 1].steps[0])}>
                Terug
              </button>
            </div>
          )}
          <p className="mt-4 text-[13px] text-kg-text-2">Je stappen blijven in de link op dit apparaat.</p>
        </div>

        <aside className="hidden border border-kg-lijn bg-kg-kalk p-6 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <Preview layout={layout} config={config} pricesActive={pricesActive} price={price} basketNote={basketNote} prefix={`${layout.slug}-paneel`} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-kg-navy bg-white print:hidden lg:hidden">
        <button
          type="button"
          className="flex h-14 w-full items-center justify-between gap-4 px-5 pr-16 text-left"
          aria-expanded={sheetOpen}
          aria-controls="kozijn-tekening"
          onClick={() => setSheetOpen((open) => !open)}
        >
          <span className="min-w-0">
            <span className="block font-mono text-[13px]">
              {config.width} × {config.height} mm
            </span>
            <span className="block truncate text-[14px]">Buitenaanzicht, van buiten gezien</span>
          </span>
          <span className="shrink-0 text-[14px] underline underline-offset-[3px]">{sheetOpen ? "Sluiten" : "Tonen"}</span>
        </button>
        {sheetOpen ? (
          <div id="kozijn-tekening" className="max-h-[70vh] overflow-y-auto border-t border-kg-lijn bg-kg-kalk px-5 py-5">
            <Preview layout={layout} config={config} pricesActive={pricesActive} price={price} basketNote={basketNote} prefix={`${layout.slug}-mobiel`} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Preview({
  layout,
  config,
  pricesActive,
  price,
  basketNote,
  prefix,
}: {
  layout: Layout;
  config: KozijnConfig;
  pricesActive: boolean;
  price: PriceResponse | null;
  basketNote: string | null;
  prefix: string;
}) {
  return (
    <div>
      <p className="font-mono text-[12px] text-kg-text-2">Buitenaanzicht</p>
      <div className="mt-3">
        <KozijnDrawing layout={layout} config={config} prefix={prefix} />
      </div>
      <KozijnOrderSummary config={config} />
      {pricesActive && price && "totalExcl" in price ? (
        <p className="mt-5 font-mono text-[18px]">
          <VatPrice incl={price.totalIncl} excl={price.totalExcl} />
        </p>
      ) : (
        <p className="mt-5 text-[14px] leading-snug text-kg-text-2">Geen prijs op het scherm. De offerte is vrijblijvend.</p>
      )}
      {basketNote ? <p className="mt-3 text-[14px]">{basketNote}</p> : null}
    </div>
  );
}

function flowSummary(id: string, layout: Layout, config: KozijnConfig) {
  if (id === "type") {
    const bits = [layout.title];
    if (layout.chooseSide) bits.push(config.side === "links" ? "scharnier links" : "scharnier rechts");
    if (layout.chooseDirection) bits.push(config.direction === "binnen" ? "naar binnen" : "naar buiten");
    if (layout.chooseActive) {
      bits.push(
        layout.group === "schuifpuien"
          ? config.active === "links"
            ? "schuift links"
            : "schuift rechts"
          : config.active === "links"
            ? "loopdeur links"
            : "loopdeur rechts",
      );
    }
    if (layout.fillings.length) bits.push(config.filling === "paneel" ? "paneel" : config.filling === "half" ? "half glas" : "vol glas");
    return bits.join(" · ");
  }
  if (id === "maten") return `${config.width} × ${config.height} mm`;
  if (id === "profiel") {
    const corner = config.corner === "hvl" ? "HVL" : "Verstek";
    const rebate = config.rebate === "aanslag" ? "met aanslag" : "stomp";
    const sill = config.sill === "laag" ? "lage dorpel" : "doorlopende dorpel";
    return `${corner} · ${rebate} · ${sill}`;
  }
  if (id === "kleur") return colorSummary(layout, config);
  if (id === "glas") {
    const glass = config.glass === "triple" ? "Triple" : "HR++";
    const spacer = config.spacer === "zwart" ? "zwarte afstandhouder" : "standaard afstandhouder";
    return `${glass} · ${spacer}`;
  }
  if (id === "beslag") {
    const hardware = config.hardware === "zwaar" ? "zwaarder beslag" : "basisbeslag";
    const handle = config.handle === "afsluitbaar" ? "afsluitbare kruk" : "standaard kruk";
    const color = config.handleColor === "aluminium" ? "aluminium" : config.handleColor;
    const screen = config.screen === "geen" ? "geen hor" : config.screen === "inzet" ? "inzethor" : "plisséhor";
    return `${hardware} · ${handle} ${color} · ${screen}`;
  }
  if (id === "ventilatie") {
    if (config.vent === "rooster") return "Ventilatierooster";
    if (config.vent === "duco") return "Duco-klep";
    return "Geen rooster";
  }
  return "Offerte";
}

function colorSummary(layout: Layout, config: KozijnConfig) {
  const sash = layout.panes.some((pane) => pane.kind !== "vast");
  const ids = [config.frameOut, config.frameIn, ...(sash ? [config.sashOut, config.sashIn] : [])];
  if (ids.includes("ral")) {
    const code = config.ralCode.trim();
    return code ? `RAL naar keuze, op aanvraag (${code})` : "RAL naar keuze, op aanvraag";
  }
  const names = [...new Set(ids.map((id) => colorLabel(id)))];
  if (names.length === 1) return names[0] ?? "";
  return `${colorLabel(config.frameOut)} buiten, ${colorLabel(config.frameIn)} binnen`;
}

function ChoiceTile({ label, note, active, onPick }: { label: string; note: string; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPick}
      className={cn("flex min-h-32 flex-col items-start border-2 px-5 py-5 text-left", active ? "border-kg-navy bg-kg-kalk" : "border-kg-lijn bg-white")}
    >
      <span className="text-[18px] leading-snug font-medium">{label}</span>
      <span className="mt-2 text-[14px] leading-snug text-kg-text-2">{note}</span>
      <span className="mt-4 font-mono text-[12px]">{active ? "Gekozen" : "Kies"}</span>
    </button>
  );
}

function SizeStep({
  layout,
  config,
  inRange,
  onChange,
}: {
  layout: Layout;
  config: KozijnConfig;
  inRange: boolean;
  onChange: (partial: Partial<KozijnConfig>) => void;
}) {
  const box = layout.limits;
  return (
    <div>
      <p className="max-w-2xl text-[16px] leading-normal text-kg-text-2">
        Online aanvragen tussen {box.minWidth} en {box.maxWidth} mm breed, en {box.minHeight} en {box.maxHeight} mm hoog.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Breedte (mm)" value={config.width} invalid={!inRange} onChange={(width) => onChange({ width })} />
        <Field label="Hoogte (mm)" value={config.height} invalid={!inRange} onChange={(height) => onChange({ height })} />
      </div>
      {inRange ? null : (
        <p className="mt-6 border border-kg-navy bg-white px-4 py-3 text-[14px] text-kg-navy" role="alert">
          Deze maat valt buiten {box.minWidth} tot {box.maxWidth} mm breed en {box.minHeight} tot {box.maxHeight} mm hoog. U kunt de aanvraag wel versturen. We beoordelen hem handmatig.
        </p>
      )}
      <p className="mt-6 text-[16px]">
        <Link href="/kunststof-kozijnen/kennisbank/hoe-moet-je-meten">Zo meet u de buitenwerkse maat</Link>
      </p>
    </div>
  );
}

function Field({ label, value, invalid = false, onChange }: { label: string; value: number; invalid?: boolean; onChange: (value: number) => void }) {
  return (
    <label className="block text-[15px]">
      {label}
      <input
        inputMode="numeric"
        aria-invalid={invalid}
        className={cn("mt-2 h-14 w-full border bg-white px-4 font-mono text-[20px]", invalid ? "border-kg-navy" : "border-kg-lijn")}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
      />
    </label>
  );
}

function TypeStep({
  layout,
  config,
  onChange,
}: {
  layout: Layout;
  config: KozijnConfig;
  onChange: (partial: Partial<KozijnConfig>) => void;
}) {
  const siblings = layoutsIn(layout.group);
  const opens = layout.panes.some((pane) => pane.kind !== "vast" && pane.kind !== "schuif");
  const quiet = !layout.chooseSide && !layout.chooseDirection && !layout.chooseActive && layout.fillings.length === 0 && !opens;
  return (
    <div className="space-y-12">
      <p className="max-w-2xl text-[16px] leading-normal text-kg-text-2">
        {publicProfileName(layout.slug)}. U staat buiten, met het gezicht naar de gevel. Links is de linkerkant vanaf die plek.
      </p>
      <div className={choiceGrid}>
        {siblings.map((item) => {
          const selected = item.slug === layout.slug;
          return (
            <Link
              key={item.slug}
              href={layoutPath(item)}
              aria-current={selected ? "page" : undefined}
              className={cn("block border-2 no-underline hover:no-underline", selected ? "border-kg-navy bg-kg-kalk" : "border-kg-lijn bg-white")}
            >
              <span className="flex h-52 items-center justify-center bg-white">
                <KozijnDrawing layout={item} config={defaultConfig(item)} caption={false} prefix={`${item.slug}-type`} fit />
              </span>
              <span className="block px-4 pt-4 text-[16px] leading-snug font-medium text-kg-navy">{item.title}</span>
              <span className="block px-4 pt-1 text-[14px] leading-snug text-kg-text-2">{item.summary}</span>
              <span className="block px-4 pt-3 pb-4 font-mono text-[12px] text-kg-navy">{selected ? "Gekozen" : "Kies"}</span>
            </Link>
          );
        })}
      </div>
      {layout.slug === "schuifpui-2-delig" ? (
        <div className="max-w-md">
          <DetailPhotoCard photo={DETAIL_PHOTOS.smartSlide} note="Het schuifprofiel van dit type." />
        </div>
      ) : null}
      {quiet ? <p className="max-w-2xl text-[16px] leading-normal text-kg-text-2">Dit vak draait niet. Er is geen scharnierzijde. Glas en kleur kiest u in de volgende stappen.</p> : null}
      {layout.group === "ramen" && opens ? <p className="text-[16px] leading-normal text-kg-text-2">Dit raam draait naar binnen.</p> : null}
      {layout.chooseSide ? (
        <fieldset>
          <legend className="text-[17px] font-medium">Scharnierzijde, van buiten</legend>
          <p className="mt-2 max-w-2xl text-[15px] leading-normal text-kg-text-2">De scharnieren zitten aan de kant die u kiest.</p>
          <div className={cn(choiceGrid, "mt-4")}>
            <ChoiceTile label="Links" note="Scharnieren aan de linkerkant, van buiten gezien." active={config.side === "links"} onPick={() => onChange({ side: "links" })} />
            <ChoiceTile label="Rechts" note="Scharnieren aan de rechterkant, van buiten gezien." active={config.side === "rechts"} onPick={() => onChange({ side: "rechts" })} />
          </div>
        </fieldset>
      ) : null}
      {layout.chooseDirection ? (
        <fieldset>
          <legend className="text-[17px] font-medium">Draairichting, van buiten gezien</legend>
          <p className="mt-2 max-w-2xl text-[15px] leading-normal text-kg-text-2">Bij een deur kiest u of de vleugel naar binnen of naar buiten draait.</p>
          <div className={cn(choiceGrid, "mt-4")}>
            <ChoiceTile label="Naar binnen" note="De vleugel draait naar de kamer." active={config.direction === "binnen"} onPick={() => onChange({ direction: "binnen" })} />
            <ChoiceTile label="Naar buiten" note="De vleugel draait naar de gevel." active={config.direction === "buiten"} onPick={() => onChange({ direction: "buiten" })} />
          </div>
        </fieldset>
      ) : null}
      {layout.chooseActive ? (
        <fieldset>
          <legend className="text-[17px] font-medium">{layout.group === "schuifpuien" ? "Schuivend deel" : "Loopdeur"}</legend>
          <div className={cn(choiceGrid, "mt-4")}>
            <ChoiceTile
              label="Links"
              note={layout.group === "schuifpuien" ? "Het schuivende deel zit links, van buiten gezien." : "De loopdeur zit links, van buiten gezien."}
              active={config.active === "links"}
              onPick={() => onChange({ active: "links" })}
            />
            <ChoiceTile
              label="Rechts"
              note={layout.group === "schuifpuien" ? "Het schuivende deel zit rechts, van buiten gezien." : "De loopdeur zit rechts, van buiten gezien."}
              active={config.active === "rechts"}
              onPick={() => onChange({ active: "rechts" })}
            />
          </div>
        </fieldset>
      ) : null}
      {layout.fillings.length ? (
        <fieldset>
          <legend className="text-[17px] font-medium">Vulling</legend>
          <div className={cn(choiceGrid, "mt-4")}>
            {layout.fillings.map((id) => (
              <ChoiceTile
                key={id}
                label={id === "paneel" ? "Paneel" : id === "half" ? "Half glas" : "Vol glas"}
                note={id === "paneel" ? "Dit deel is dicht." : id === "half" ? "Glas boven, paneel onder." : "Glas over de volle hoogte."}
                active={config.filling === id}
                onPick={() => onChange({ filling: id })}
              />
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

function CornerStep({ layout, config, onChange }: { layout: Layout; config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-8">
      {layout.group === "schuifpuien" ? null : (
        <div className="max-w-md">
          <DetailPhotoCard photo={DETAIL_PHOTOS.profile} note="Aluplast Ideal 7000 NL. Eén profiel voor de ramen en deuren." />
        </div>
      )}
      <fieldset>
        <legend className="text-[17px] font-medium">Hoekuitvoering</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <DetailPhotoCard
            photo={DETAIL_PHOTOS.verstek}
            note="De naad loopt schuin over de hoek."
            active={config.corner === "verstek"}
            onPick={() => onChange({ corner: "verstek" })}
          />
          <DetailPhotoCard
            photo={DETAIL_PHOTOS.hvl}
            note="De profielen komen haaks samen. De naad staat recht."
            active={config.corner === "hvl"}
            onPick={() => onChange({ corner: "hvl" })}
          />
        </div>
      </fieldset>
      <p className="max-w-2xl text-[15px] leading-normal text-kg-text-2">
        Verstek: de naad loopt schuin over de hoek. HVL: de profielen komen haaks samen en de naad staat recht. Een isolatieverschil publiceren we niet.
      </p>
    </div>
  );
}

function ColorStep({
  layout,
  config,
  onChange,
}: {
  layout: Layout;
  config: KozijnConfig;
  onChange: (partial: Partial<KozijnConfig>) => void;
}) {
  const sash = layout.panes.some((pane) => pane.kind !== "vast");
  return (
    <div className="space-y-12">
      <p className="max-w-2xl text-[16px] leading-normal text-kg-text-2">Kies je kleur. Dit zijn de snelle keuzes. De volledige AP-lijst volgt. De folie bevestigen we op de offerte.</p>
      <div className={choiceGrid}>
        <DetailPhotoCard photo={DETAIL_PHOTOS.folie} note="Voorbeelden van folie. De gekozen folie staat op de offerte." />
        <DetailPhotoCard photo={DETAIL_PHOTOS.ral} note="RAL naar keuze blijft op aanvraag." />
      </div>
      <ColorTiles label="Kozijn buiten" value={config.frameOut} onPick={(frameOut) => onChange({ frameOut: frameOut as KozijnConfig["frameOut"] })} />
      <ColorTiles label="Kozijn binnen" value={config.frameIn} onPick={(frameIn) => onChange({ frameIn: frameIn as KozijnConfig["frameIn"] })} />
      {sash ? (
        <>
          <ColorTiles label="Vleugel buiten" value={config.sashOut} onPick={(sashOut) => onChange({ sashOut: sashOut as KozijnConfig["sashOut"] })} />
          <ColorTiles label="Vleugel binnen" value={config.sashIn} onPick={(sashIn) => onChange({ sashIn: sashIn as KozijnConfig["sashIn"] })} />
        </>
      ) : null}
      {ralOpen(layout, config) ? (
        <label className="block max-w-md text-[15px]">
          RAL-code
          <input
            value={config.ralCode}
            maxLength={24}
            autoComplete="off"
            placeholder="Bijvoorbeeld 7016"
            className="mt-2 h-14 w-full border border-kg-lijn bg-white px-4 font-mono text-[18px]"
            onChange={(event) => onChange({ ralCode: event.target.value.replace(/[^0-9A-Za-z -]/g, "").slice(0, 24) })}
          />
          <span className="mt-2 block text-[14px] leading-snug text-kg-text-2">Op aanvraag. De code komt op de offerte, het bedrag niet.</span>
        </label>
      ) : null}
    </div>
  );
}

function ralOpen(layout: Layout, config: KozijnConfig) {
  const ids = [config.frameOut, config.frameIn];
  if (layout.panes.some((pane) => pane.kind !== "vast")) ids.push(config.sashOut, config.sashIn);
  return ids.includes("ral");
}

function ColorTiles({ label, value, onPick }: { label: string; value: string; onPick: (id: string) => void }) {
  return (
    <fieldset>
      <legend className="text-[17px] font-medium">{label}</legend>
      <div className={cn(choiceGrid, "mt-4")}>
        {FRAME_COLORS.map((color) => {
          const active = color.id === value;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onPick(color.id)}
              aria-pressed={active}
              className={cn("block border-2 text-left", active ? "border-kg-navy bg-kg-kalk" : "border-kg-lijn bg-white")}
            >
              {color.swatch ? (
                <span className="relative block aspect-[4/3] overflow-hidden bevel-16 bg-kg-kalk">
                  <img src={color.swatch} alt="" width={960} height={720} className="absolute inset-0 h-full w-full object-cover" />
                </span>
              ) : (
                <span className="block aspect-[4/3] border border-kg-lijn bevel-16" style={{ background: color.hex }} />
              )}
              <span className="block px-4 pt-4 text-[16px] leading-snug font-medium">{color.name}</span>
              <span className="block px-4 pt-1 text-[14px] leading-snug text-kg-text-2">
                {color.id === "ral" ? "Op aanvraag. Het bedrag staat niet op het scherm." : color.code}
              </span>
              <span className="block px-4 pt-3 pb-4 font-mono text-[12px]">{active ? "Gekozen" : "Kies"}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function GlassStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-12">
      <fieldset>
        <legend className="text-[17px] font-medium">Isolatie</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <DetailPhotoCard photo={DETAIL_PHOTOS.hrpp} label="HR++" note="Dubbel isolatieglas." active={config.glass === "hrpp"} onPick={() => onChange({ glass: "hrpp" })} />
          <DetailPhotoCard
            photo={DETAIL_PHOTOS.triple}
            label="Triple"
            note="Drie ruiten. Het profiel neemt glas tot 52 mm."
            active={config.glass === "triple"}
            onPick={() => onChange({ glass: "triple" })}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[17px] font-medium">Afstandhouder</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <ChoiceTile label="Standaard" note="Aluminium of grijs, de gewone afstandhouder." active={config.spacer === "standaard"} onPick={() => onChange({ spacer: "standaard" })} />
          <DetailPhotoCard
            photo={DETAIL_PHOTOS.spacerZwart}
            note="Zwarte warm edge in het glas."
            active={config.spacer === "zwart"}
            onPick={() => onChange({ spacer: "zwart" })}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[17px] font-medium">Onderkant van het glas</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          {LOW_GLASS.map((item) => (
            <ChoiceTile
              key={item.id}
              label={item.label}
              note={item.id === "ja" ? "Lager dan 85 cm. We zetten gelaagd glas klaar." : item.id === "nee" ? "Hoger dan 85 cm." : "We beoordelen dit bij de offerte."}
              active={config.lowGlass === item.id}
              onPick={() => onChange({ lowGlass: item.id })}
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[17px] font-medium">Gelaagd</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          {LAMINATED.map((item) => (
            <ChoiceTile
              key={item.id}
              label={item.label}
              note={item.id === "geen" ? "Geen gelaagde ruit." : item.id === "binnen" ? "De binnenruit is gelaagd." : "Binnen- en buitenruit zijn gelaagd."}
              active={config.laminated === item.id}
              onPick={() => onChange({ laminated: item.id, laminatedTouched: true })}
            />
          ))}
        </div>
      </fieldset>
      <p className="max-w-2xl text-[15px] leading-normal text-kg-text-2">
        Onder 85 cm, en bij deuren en schuifpuien, zetten we gelaagd glas klaar. U kunt dat wijzigen. De uitleg staat bij het glasartikel.
      </p>
    </div>
  );
}

function VentStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Ventilatie</legend>
      <div className={choiceGrid}>
        <ChoiceTile label="Geen rooster" note="Het kader blijft dicht aan de bovenkant." active={config.vent === "geen"} onPick={() => onChange({ vent: "geen" })} />
        <DetailPhotoCard
          photo={DETAIL_PHOTOS.rooster}
          label="Ventilatierooster"
          note="Een rooster in het kader."
          active={config.vent === "rooster"}
          onPick={() => onChange({ vent: "rooster" })}
        />
        <DetailPhotoCard photo={DETAIL_PHOTOS.duco} note="Een klep voor het kozijn." active={config.vent === "duco"} onPick={() => onChange({ vent: "duco" })} />
      </div>
    </fieldset>
  );
}

function SillStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-12">
      <fieldset>
        <legend className="text-[17px] font-medium">Aansluiting</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <DetailPhotoCard photo={DETAIL_PHOTOS.stomp} note="Het kader sluit zonder aanslag." active={config.rebate === "stomp"} onPick={() => onChange({ rebate: "stomp" })} />
          <DetailPhotoCard photo={DETAIL_PHOTOS.aanslag} note="Het kader heeft een aanslag." active={config.rebate === "aanslag"} onPick={() => onChange({ rebate: "aanslag" })} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[17px] font-medium">Onderdorpel</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <ChoiceTile
            label="Doorlopend kunststof"
            note="Onderdorpel in hetzelfde profiel."
            active={config.sill === "doorlopend"}
            onPick={() => onChange({ sill: "doorlopend" })}
          />
          <ChoiceTile label="Lage dorpel" note="Een lagere dorpel. De uitvoering volgt in de offerte." active={config.sill === "laag"} onPick={() => onChange({ sill: "laag" })} />
        </div>
      </fieldset>
    </div>
  );
}

function HardwareStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-12">
      <fieldset>
        <legend className="text-[17px] font-medium">Hang- en sluitwerk</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <ChoiceTile label="Zwaarder beslag" note="Dit vragen we standaard aan." active={config.hardware === "zwaar"} onPick={() => onChange({ hardware: "zwaar" })} />
          <ChoiceTile label="Basis" note="Het lichtere hang- en sluitwerk." active={config.hardware === "basis"} onPick={() => onChange({ hardware: "basis" })} />
        </div>
      </fieldset>
      <p className="max-w-2xl text-[15px] leading-normal text-kg-text-2">
        We vragen het zwaardere beslag aan. Een keurmerk zetten we er pas bij als de leverancier dat voor dit profiel bevestigt.
      </p>
      <fieldset>
        <legend className="text-[17px] font-medium">Kruk</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <DetailPhotoCard photo={DETAIL_PHOTOS.kruk} label="Standaard" note="De gewone kruk, zonder slot." active={config.handle === "standaard"} onPick={() => onChange({ handle: "standaard" })} />
          <DetailPhotoCard
            photo={DETAIL_PHOTOS.krukSlot}
            label="Afsluitbaar"
            note="De kruk kan op slot."
            active={config.handle === "afsluitbaar"}
            onPick={() => onChange({ handle: "afsluitbaar" })}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[17px] font-medium">Kleur van de kruk</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <DetailPhotoCard photo={DETAIL_PHOTOS.krukWit} note="De witte kruk." active={config.handleColor === "wit"} onPick={() => onChange({ handleColor: "wit" })} />
          <DetailPhotoCard photo={DETAIL_PHOTOS.krukAlu} note="Een aluminium kruk." active={config.handleColor === "aluminium"} onPick={() => onChange({ handleColor: "aluminium" })} />
          <DetailPhotoCard photo={DETAIL_PHOTOS.krukZwart} note="Een zwarte kruk." active={config.handleColor === "zwart"} onPick={() => onChange({ handleColor: "zwart" })} />
        </div>
      </fieldset>
    </div>
  );
}

function ExtraStep({
  layout,
  config,
  onChange,
}: {
  layout: Layout;
  config: KozijnConfig;
  onChange: (partial: Partial<KozijnConfig>) => void;
}) {
  const door = layout.group !== "ramen";
  const extra = STEPS.find((step) => step.id === "extra");
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-[17px] font-medium">Hor</legend>
        <div className={cn(choiceGrid, "mt-4")}>
          <ChoiceTile label="Geen hor" note="Geen hor bij dit kozijn." active={config.screen === "geen"} onPick={() => onChange({ screen: "geen" })} />
          <ChoiceTile label="Inzethor" note="Vraagt u mee in de offerte." active={config.screen === "inzet"} onPick={() => onChange({ screen: "inzet" })} />
          {door ? <ChoiceTile label="Plisséhor" note="Voor een deur of schuifpui. Vraagt u mee in de offerte." active={config.screen === "plisse"} onPick={() => onChange({ screen: "plisse" })} /> : null}
        </div>
      </fieldset>
      <p className="max-w-2xl text-[15px] leading-normal text-kg-text-2">
        Wij leveren het kozijn. Plaatsen doet u zelf. Horren vraagt u in de offerte, niet als bedrag in deze stap.{" "}
        {extra ? <Link href={`/kunststof-kozijnen/kennisbank/${extra.article}`}>Uitleg over plaatsen</Link> : null}
      </p>
    </div>
  );
}

function Overview({
  lines,
  pdfHref,
  share,
  price,
  sent,
  error,
  sending,
  onQuote,
  onBasket,
}: {
  lines: { label: string; value: string }[];
  pdfHref: string;
  share: string;
  price: PriceResponse | null;
  sent: string | null;
  error: string | null;
  sending: boolean;
  onQuote: (form: FormData) => void;
  onBasket: () => void;
}) {
  const wa = `${site.whatsapp}?text=${encodeURIComponent(`Kozijn samengesteld: ${share}`)}`;
  return (
    <div className="space-y-8">
      <dl className="divide-y divide-kg-lijn border-y border-kg-lijn">
        {lines.map((line) => (
          <div key={line.label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-6">
            <dt className="font-mono text-[13px] text-kg-text-2">{line.label}</dt>
            <dd className="text-[16px] leading-snug">{line.value}</dd>
          </div>
        ))}
      </dl>
      {price?.pricesActive ? (
        <p className="font-mono text-[18px]">
          <VatPrice incl={price.totalIncl} excl={price.totalExcl} />
        </p>
      ) : (
        <p className="text-[16px] leading-normal">Vrijblijvende offerte aanvragen. Er staat geen bedrag op deze samenstelling.</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonVariants({ variant: "secondary", size: "sm" })} onClick={onBasket}>
          Zet in de offertemand
        </button>
        <Link href="/kunststof-kozijnen/offertemand" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          Offertemand
        </Link>
        <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={pdfHref}>
          Aanvraag als PDF
        </a>
        <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={wa}>
          WhatsApp deze link
        </a>
        <button type="button" className={buttonVariants({ variant: "secondary", size: "sm" })} onClick={() => void navigator.clipboard.writeText(share)}>
          Kopieer de link
        </button>
      </div>
      {sent ? (
        <p className="border border-kg-navy bg-white p-5">Aanvraag {sent} is verstuurd. U hoort op een werkdag van ons.</p>
      ) : (
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onQuote(new FormData(event.currentTarget));
          }}
        >
          <label className="text-[15px] sm:col-span-2">
            Naam
            <input name="name" required autoComplete="name" className="mt-2 h-12 w-full border border-kg-lijn bg-white px-3" />
          </label>
          <label className="text-[15px]">
            E-mail
            <input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full border border-kg-lijn bg-white px-3" />
          </label>
          <label className="text-[15px]">
            Telefoon
            <input name="phone" required autoComplete="tel" className="mt-2 h-12 w-full border border-kg-lijn bg-white px-3" />
          </label>
          <label className="text-[15px]">
            Postcode
            <input name="postcode" required autoComplete="postal-code" className="mt-2 h-12 w-full border border-kg-lijn bg-white px-3" />
          </label>
          <label className="text-[15px] sm:col-span-2">
            Opmerking
            <textarea name="note" rows={3} className="mt-2 w-full border border-kg-lijn bg-white px-3 py-2" />
          </label>
          <label className="hidden">
            Website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>
          {error ? <p className="border border-kg-navy px-3 py-2 text-[14px] text-kg-navy sm:col-span-2">{error}</p> : null}
          <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")} disabled={sending}>
            {sending ? "Versturen" : "Vrijblijvende offerte aanvragen"}
          </button>
          <p className="text-[13px] text-kg-text-2 sm:col-span-2">Je gegevens gebruiken we alleen voor deze aanvraag.</p>
        </form>
      )}
    </div>
  );
}
