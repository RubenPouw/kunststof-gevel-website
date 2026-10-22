"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnOrderSummary, KozijnPicture } from "@/components/kozijnen/product-picture";
import { CornerFigures } from "@/components/kozijnen/figures";
import { buttonVariants } from "@/components/ui/button";
import {
  CORNERS,
  FRAME_COLORS,
  GLASS_TYPES,
  LAMINATED,
  LOW_GLASS,
} from "@/lib/kozijnen/config";
import { layoutPath, type Layout } from "@/lib/kozijnen/layouts";
import { VatPrice } from "@/components/brand/vat-price";
import { addBasketItem, readBasket, writeBasket } from "@/lib/kozijnen/basket";
import {
  KOZIJN_STORAGE_KEY,
  STEPS,
  applyLaminatedDefault,
  defaultConfig,
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

export function KozijnConfigurator({ layout, pricesActive }: { layout: Layout; pricesActive: boolean }) {
  const init = useRef<string | null>(null);
  const [config, setConfig] = useState<KozijnConfig>(() => defaultConfig(layout));
  const [ready, setReady] = useState(false);
  const [askResume, setAskResume] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"tekening" | "aanzicht">("aanzicht");
  const [basketNote, setBasketNote] = useState<string | null>(null);

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

  const stepIndex = Math.max(0, STEPS.findIndex((step) => step.id === config.step));
  const step = STEPS[stepIndex] ?? STEPS[0];
  const inRange = sizeInRange(layout, config.width, config.height);
  const lines = useMemo(() => summaryLines(config), [config]);
  const pdfHref = `/api/kozijnen/pdf?layout=${encodeURIComponent(layout.slug)}&${serializeConfig(config)}`;

  function patch(partial: Partial<KozijnConfig>) {
    setConfig((current) => applyLaminatedDefault({ ...current, ...partial }, layout));
  }

  function go(next: StepId) {
    if (next !== STEPS[0].id) setAskResume(false);
    patch({ step: next });
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

  const share = `${site.origin}${layoutPath(layout)}?${serializeConfig(config)}`;

  return (
    <div className="container-kg pb-16">
      {resumeVisible(config.step, askResume) ? (
        <div className="mb-6 border border-kg-navy bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">Je was al bezig met een kozijn. Verder gaan of opnieuw beginnen?</p>
            <button type="button" className="grid size-11 shrink-0 place-items-center" onClick={() => setAskResume(false)} aria-label="Melding sluiten">
              ×
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonVariants({ size: "sm" })} onClick={() => resume(true)}>
              Verder gaan
            </button>
            <button type="button" className={buttonVariants({ variant: "secondary", size: "sm" })} onClick={() => resume(false)}>
              Opnieuw beginnen
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div className="order-2 lg:order-1">
          <p className="font-mono text-[13px] text-kg-text-2">
            {String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} · {step.label}
          </p>
          <ol className="mt-3 flex flex-wrap gap-1">
            {STEPS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    "h-11 min-w-11 px-2 font-mono text-[12px]",
                    item.id === step.id ? "bg-kg-navy text-white" : "text-kg-text-2",
                  )}
                  aria-current={item.id === step.id ? "step" : undefined}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ol>
          <StepHint step={step} />

          <div className="mt-6">
            {step.id === "maten" ? <SizeStep layout={layout} config={config} inRange={inRange} onChange={patch} /> : null}
            {step.id === "indeling" ? <LayoutStep layout={layout} config={config} onChange={patch} /> : null}
            {step.id === "hoek" ? <CornerStep config={config} onChange={patch} /> : null}
            {step.id === "kleur" ? <ColorStep layout={layout} config={config} onChange={patch} /> : null}
            {step.id === "glas" ? <GlassStep config={config} onChange={patch} /> : null}
            {step.id === "ventilatie" ? <ChoiceStep label="Ventilatie" value={config.vent} options={[{ id: "geen", label: "Geen rooster" }, { id: "rooster", label: "Zelfregulerend rooster" }]} onPick={(vent) => patch({ vent: vent as KozijnConfig["vent"] })} /> : null}
            {step.id === "dorpel" ? <SillStep config={config} onChange={patch} /> : null}
            {step.id === "beslag" ? <HardwareStep config={config} onChange={patch} /> : null}
            {step.id === "extra" ? <ExtraStep layout={layout} config={config} onChange={patch} /> : null}
            {step.id === "overzicht" ? (
              <Overview
                lines={lines}
                pdfHref={pdfHref}
                share={share}
                price={pricesActive ? price : { pricesActive: false }}
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

          {step.id !== "overzicht" ? (
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonVariants({ variant: "secondary" })}
                disabled={stepIndex === 0}
                onClick={() => go(STEPS[stepIndex - 1].id)}
              >
                Terug
              </button>
              <button type="button" className={buttonVariants()} onClick={() => go(STEPS[stepIndex + 1].id)}>
                Volgende
              </button>
            </div>
          ) : null}
          <p className="mt-3 text-[13px] text-kg-text-2">Je stappen blijven in de link op dit apparaat.</p>
        </div>

        <aside className="order-1 border border-kg-lijn bg-kg-kalk p-4 lg:sticky lg:top-24 lg:order-2">
          <div className="mt-3 flex gap-2">
            <button type="button" className={cn("h-10 border px-3 text-[14px]", view === "tekening" ? "border-kg-navy bg-white" : "border-kg-lijn")} onClick={() => setView("tekening")}>
              Tekening
            </button>
            <button type="button" className={cn("h-10 border px-3 text-[14px]", view === "aanzicht" ? "border-kg-navy bg-white" : "border-kg-lijn")} onClick={() => setView("aanzicht")}>
              Aanzicht
            </button>
          </div>
          {view === "tekening" ? <KozijnDrawing layout={layout} config={config} /> : <KozijnPicture layout={layout} config={config} />}
          <KozijnOrderSummary config={config} />
          {pricesActive && price && "totalExcl" in price ? (
            <p className="mt-3 font-mono text-[18px]">
              <VatPrice incl={price.totalIncl} excl={price.totalExcl} />
            </p>
          ) : (
            <p className="mt-3 text-[14px] leading-snug text-kg-text-2">Geen prijs op het scherm. De offerte is vrijblijvend.</p>
          )}
          {basketNote ? <p className="mt-2 text-[14px]">{basketNote}</p> : null}
        </aside>
      </div>
    </div>
  );
}

function StepHint({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <p className="mt-4 flex items-start gap-3 text-[14px] leading-snug text-kg-text-2">
      <Link
        href={`/kunststof-kozijnen/kennisbank/${step.article}`}
        className="inline-flex size-11 shrink-0 items-center justify-center border border-kg-lijn bg-white text-kg-navy no-underline"
        aria-label={`Uitleg over ${step.label}`}
      >
        ?
      </Link>
      <span className="pt-2.5">{step.hint}</span>
    </p>
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
      <p className="text-[14px] text-kg-text-2">
        Online aanvragen tussen {box.minWidth} en {box.maxWidth} mm breed, en {box.minHeight} en {box.maxHeight} mm hoog.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Breedte (mm)" value={config.width} invalid={!inRange} onChange={(width) => onChange({ width })} />
        <Field label="Hoogte (mm)" value={config.height} invalid={!inRange} onChange={(height) => onChange({ height })} />
      </div>
      {inRange ? null : (
        <p className="mt-3 border border-kg-navy bg-white px-3 py-2 text-[14px] text-kg-navy" role="alert">
          Deze maat valt buiten {box.minWidth} tot {box.maxWidth} mm breed en {box.minHeight} tot {box.maxHeight} mm hoog. U kunt de aanvraag wel versturen. We beoordelen hem handmatig.
        </p>
      )}
      <p className="mt-2 text-[14px]">
        <Link href="/kunststof-kozijnen/kennisbank/hoe-moet-je-meten">Zo meet u de buitenwerkse maat</Link>
      </p>
    </div>
  );
}

function Field({ label, value, invalid = false, onChange }: { label: string; value: number; invalid?: boolean; onChange: (value: number) => void }) {
  return (
    <label className="block text-[14px]">
      {label}
      <input
        inputMode="numeric"
        aria-invalid={invalid}
        className={cn("mt-1 h-12 w-full border bg-white px-3 font-mono text-[16px]", invalid ? "border-kg-navy" : "border-kg-lijn")}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => {
        const next = Number(event.target.value);
        onChange(Number.isFinite(next) ? next : 0);
      }}
      />
    </label>
  );
}

function LayoutStep({
  layout,
  config,
  onChange,
}: {
  layout: Layout;
  config: KozijnConfig;
  onChange: (partial: Partial<KozijnConfig>) => void;
}) {
  const opens = layout.panes.some((pane) => pane.kind !== "vast" && pane.kind !== "schuif");
  if (!layout.chooseSide && !layout.chooseDirection && !layout.chooseActive && layout.fillings.length === 0 && !opens) {
    return <p className="text-[16px] text-kg-text-2">Dit vak draait niet. Er is geen scharnierzijde. Glas en kleur kiest u in de volgende stappen.</p>;
  }
  return (
    <div className="space-y-6">
      <p className="text-[14px] text-kg-text-2">
        U staat buiten, met het gezicht naar de gevel. Links is de linkerkant vanaf die plek.
        {layout.chooseSide ? " De scharnieren zitten aan de kant die u kiest." : ""}
        {layout.chooseActive && layout.group === "schuifpuien" ? " Het schuivende deel zit aan de kant die u kiest." : ""}
        {layout.chooseActive && layout.group !== "schuifpuien" ? " De loopdeur zit aan de kant die u kiest." : ""}
      </p>
      {layout.group === "ramen" && opens ? (
        <p className="text-[14px] text-kg-text-2">Dit raam draait naar binnen.</p>
      ) : null}
      {layout.chooseSide ? (
        <ChoiceStep
          label="Scharnierzijde, van buiten"
          value={config.side}
          options={[
            { id: "links", label: "Links" },
            { id: "rechts", label: "Rechts" },
          ]}
          onPick={(side) => onChange({ side: side as KozijnConfig["side"] })}
        />
      ) : null}
      {layout.chooseDirection ? (
        <>
        <p className="text-[14px] text-kg-text-2">Bij een deur kiest u of de vleugel naar binnen of naar buiten draait.</p>
        <ChoiceStep
          label="Draairichting, van buiten gezien"
          value={config.direction}
          options={[
            { id: "binnen", label: "Naar binnen" },
            { id: "buiten", label: "Naar buiten" },
          ]}
          onPick={(direction) => onChange({ direction: direction as KozijnConfig["direction"] })}
        />
        </>
      ) : null}
      {layout.chooseActive ? (
        <ChoiceStep
          label={layout.group === "schuifpuien" ? "Schuivend deel" : "Loopdeur"}
          value={config.active}
          options={[
            { id: "links", label: "Links" },
            { id: "rechts", label: "Rechts" },
          ]}
          onPick={(active) => onChange({ active: active as KozijnConfig["active"] })}
        />
      ) : null}
      {layout.fillings.length ? (
        <ChoiceStep
          label="Vulling"
          value={config.filling}
          options={layout.fillings.map((id) => ({
            id,
            label: id === "paneel" ? "Paneel" : id === "half" ? "Half glas" : "Vol glas",
          }))}
          onPick={(filling) => onChange({ filling: filling as KozijnConfig["filling"] })}
        />
      ) : null}
    </div>
  );
}

function CornerStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-6">
      <CornerFigures />
      <ChoiceStep
        label="Hoekuitvoering"
        value={config.corner}
        options={CORNERS.map((item) => ({ id: item.id, label: item.label }))}
        onPick={(corner) => onChange({ corner: corner as KozijnConfig["corner"] })}
      />
      <p className="text-[14px] text-kg-text-2">
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
    <div className="space-y-6">
      <p className="text-[14px] text-kg-text-2">Kies je kleur. Dit zijn de snelle keuzes. De volledige AP-lijst volgt. De folie bevestigen we op de offerte.</p>
      <Swatches label="Kozijn buiten" value={config.frameOut} onPick={(frameOut) => onChange({ frameOut: frameOut as KozijnConfig["frameOut"] })} />
      <Swatches label="Kozijn binnen" value={config.frameIn} onPick={(frameIn) => onChange({ frameIn: frameIn as KozijnConfig["frameIn"] })} />
      {sash ? (
        <>
          <Swatches label="Vleugel buiten" value={config.sashOut} onPick={(sashOut) => onChange({ sashOut: sashOut as KozijnConfig["sashOut"] })} />
          <Swatches label="Vleugel binnen" value={config.sashIn} onPick={(sashIn) => onChange({ sashIn: sashIn as KozijnConfig["sashIn"] })} />
        </>
      ) : null}
    </div>
  );
}

function Swatches({ label, value, onPick }: { label: string; value: string; onPick: (id: string) => void }) {
  return (
    <fieldset>
      <legend className="text-[14px] font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {FRAME_COLORS.map((color) => {
          const active = color.id === value;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onPick(color.id)}
              className={cn("flex h-12 items-center gap-2 border px-2", active ? "border-kg-navy" : "border-kg-lijn")}
              aria-pressed={active}
            >
              <span className="size-6 border border-kg-lijn" style={{ background: color.hex }} />
              <span className="text-[13px]">{color.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function GlassStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-6">
      <ChoiceStep
        label="Isolatie"
        value={config.glass}
        options={GLASS_TYPES.map((item) => ({ id: item.id, label: item.label }))}
        onPick={(glass) => onChange({ glass: glass as KozijnConfig["glass"] })}
      />
      <ChoiceStep
        label="Onderkant van het glas"
        value={config.lowGlass}
        options={LOW_GLASS.map((item) => ({ id: item.id, label: item.label }))}
        onPick={(lowGlass) => onChange({ lowGlass: lowGlass as KozijnConfig["lowGlass"] })}
      />
      <ChoiceStep
        label="Gelaagd"
        value={config.laminated}
        options={LAMINATED.map((item) => ({ id: item.id, label: item.label }))}
        onPick={(laminated) => onChange({ laminated: laminated as KozijnConfig["laminated"], laminatedTouched: true })}
      />
      <p className="text-[14px] text-kg-text-2">
        Onder 85 cm, en bij deuren en schuifpuien, zetten we gelaagd glas klaar. U kunt dat wijzigen. De uitleg staat bij het glasartikel.
      </p>
    </div>
  );
}

function SillStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-6">
      <ChoiceStep
        label="Aansluiting"
        value={config.rebate}
        options={[
          { id: "stomp", label: "Stomp" },
          { id: "aanslag", label: "Met aanslag" },
        ]}
        onPick={(rebate) => onChange({ rebate: rebate as KozijnConfig["rebate"] })}
      />
      <ChoiceStep
        label="Onderdorpel"
        value={config.sill}
        options={[
          { id: "doorlopend", label: "Doorlopend kunststof" },
          { id: "laag", label: "Lage dorpel" },
        ]}
        onPick={(sill) => onChange({ sill: sill as KozijnConfig["sill"] })}
      />
    </div>
  );
}

function HardwareStep({ config, onChange }: { config: KozijnConfig; onChange: (partial: Partial<KozijnConfig>) => void }) {
  return (
    <div className="space-y-6">
      <ChoiceStep
        label="Hang- en sluitwerk"
        value={config.hardware}
        options={[
          { id: "zwaar", label: "Zwaarder beslag" },
          { id: "basis", label: "Basis" },
        ]}
        onPick={(hardware) => onChange({ hardware: hardware as KozijnConfig["hardware"] })}
      />
      <p className="text-[14px] text-kg-text-2">
        We vragen het zwaardere beslag aan. Een keurmerk zetten we er pas bij als de leverancier dat voor dit profiel bevestigt.
      </p>
      <ChoiceStep
        label="Kruk"
        value={config.handle}
        options={[
          { id: "standaard", label: "Standaard" },
          { id: "afsluitbaar", label: "Afsluitbaar" },
        ]}
        onPick={(handle) => onChange({ handle: handle as KozijnConfig["handle"] })}
      />
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
  return (
    <div className="space-y-4">
      <ChoiceStep
        label="Hor"
        value={config.screen}
        options={[
          { id: "geen", label: "Geen hor" },
          { id: "inzet", label: "Inzethor" },
          ...(door ? [{ id: "plisse", label: "Plisséhor" }] : []),
        ]}
        onPick={(screen) => onChange({ screen: screen as KozijnConfig["screen"] })}
      />
      <p className="text-[14px] text-kg-text-2">
        Wij leveren het kozijn. Plaatsen doet u zelf. Horren vraagt u in de offerte, niet als bedrag in deze stap.
      </p>
    </div>
  );
}

function ChoiceStep({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[14px] font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option.id)}
              className={cn("h-12 border px-3 text-[14px]", active ? "border-kg-navy bg-white" : "border-kg-lijn")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
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
    <div className="space-y-6">
      <dl className="divide-y divide-kg-lijn border-y border-kg-lijn">
        {lines.map((line) => (
          <div key={line.label} className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="font-mono text-[13px] text-kg-text-2">{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
      {price?.pricesActive ? (
        <p className="font-mono text-[18px]">
          <VatPrice incl={price.totalIncl} excl={price.totalExcl} />
        </p>
      ) : (
        <p className="text-[16px]">Vrijblijvende offerte aanvragen. Er staat geen bedrag op deze samenstelling.</p>
      )}
      <div className="flex flex-wrap gap-2">
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
        <button
          type="button"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
          onClick={() => void navigator.clipboard.writeText(share)}
        >
          Kopieer de link
        </button>
      </div>
      {sent ? (
        <p className="border border-kg-navy bg-white p-4">Aanvraag {sent} is verstuurd. U hoort op een werkdag van ons.</p>
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onQuote(new FormData(event.currentTarget));
          }}
        >
          <label className="text-[14px] sm:col-span-2">
            Naam
            <input name="name" required autoComplete="name" className="mt-1 h-12 w-full border border-kg-lijn px-3" />
          </label>
          <label className="text-[14px]">
            E-mail
            <input name="email" type="email" required autoComplete="email" className="mt-1 h-12 w-full border border-kg-lijn px-3" />
          </label>
          <label className="text-[14px]">
            Telefoon
            <input name="phone" required autoComplete="tel" className="mt-1 h-12 w-full border border-kg-lijn px-3" />
          </label>
          <label className="text-[14px]">
            Postcode
            <input name="postcode" required autoComplete="postal-code" className="mt-1 h-12 w-full border border-kg-lijn px-3" />
          </label>
          <label className="text-[14px] sm:col-span-2">
            Opmerking
            <textarea name="note" rows={3} className="mt-1 w-full border border-kg-lijn px-3 py-2" />
          </label>
          <label className="hidden">
            Website
            <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
          </label>
          {error ? <p className="text-[14px] text-kg-navy sm:col-span-2">{error}</p> : null}
          <button type="submit" className={cn(buttonVariants(), "sm:col-span-2")} disabled={sending}>
            {sending ? "Versturen" : "Vrijblijvende offerte aanvragen"}
          </button>
          <p className="text-[13px] text-kg-text-2 sm:col-span-2">Je gegevens gebruiken we alleen voor deze aanvraag.</p>
        </form>
      )}
    </div>
  );
}
