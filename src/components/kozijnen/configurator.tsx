"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Bevel, SectionHead } from "@/components/brand/section-head";
import { CavemenMark } from "@/components/brand/marks";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNlNumber, formatPrice } from "@/lib/format";
import {
  clampKozijnMm,
  kozijnBasePrice,
  kozijnM2,
  kozijnMountPrice,
  KZ_COLORS,
  KZ_GLASS,
  KZ_TYPES,
} from "@/lib/kozijnen";
import { weekNow } from "@/lib/week";
import { cn } from "@/lib/utils";

const STEPS = [
  { k: "01 · vandaag", n: "Samenstellen", d: "Type, maat, kleur, glas. Prijs direct in beeld, geen offerte nodig." },
  { k: "02 · binnen 2 dagen", n: "Maatcontrole", d: "Wij controleren uw maten. Twijfel? Een Caveman meet in voor € 95." },
  { k: "03 · 15 werkdagen", n: "Productie en levering", d: "Kömmerling 76 mm, gemaakt in Nederland. Bezorgd of afhalen in Hedel." },
  { k: "04 · zelfde week", n: "Gezet door een Caveman", d: "Oud kozijn eruit, nieuw gesteld en afgekit. Eén factuur via uw account." },
];

export function KozijnenConfigurator() {
  const router = useRouter();
  const { add } = useCart();
  const week = weekNow();
  const [typeIndex, setTypeIndex] = useState(1);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1400);
  const [colorIndex, setColorIndex] = useState(2);
  const [glassIndex, setGlassIndex] = useState(0);
  const [mount, setMount] = useState(1);

  const w = clampKozijnMm(width);
  const h = clampKozijnMm(height);
  const m2 = kozijnM2(w, h);
  const type = KZ_TYPES[typeIndex];
  const color = KZ_COLORS[colorIndex];
  const glass = KZ_GLASS[glassIndex];
  const base = kozijnBasePrice(m2, typeIndex, colorIndex, glassIndex);
  const mountPrice = kozijnMountPrice(m2);
  const hasMount = mount === 1;
  const total = base + (hasMount ? mountPrice : 0);
  const title = `${type.name}, ${color.name.toLowerCase()}, ${w} × ${h}`;
  const ratio = Math.max(w, h);
  const prevW = Math.round(Math.min(100, 100 * Math.min(1, w / ratio)));
  const prevH = Math.round(Math.min(100, 100 * Math.min(1, h / ratio)));

  const lead = hasMount ? `Levering en montage week ${week + 3}` : `Levering week ${week + 3}`;
  const cta = hasMount ? "In bestelling · inclusief montage" : "In bestelling · alleen levering";

  const facts = useMemo(
    () => [
      ["Kömmerling 76", "kunststof profiel"],
      ["HR++ of triple", "naar keuze"],
      ["15 werkdagen", "productie"],
    ],
    [],
  );

  function onAdd() {
    add({
      productSlug: "kozijn",
      variantSku: `KZ-${Date.now()}`,
      qty: 1,
      kind: "kozijn",
      name: title,
      brand: "Kömmerling 76",
      colorName: color.name,
      price: total,
      hex: color.hex,
      mount: hasMount,
      skuLabel: `Kömmerling 76 · ${glass.name}${hasMount ? " · incl. montage" : ""}`,
    });
    router.push("/winkelwagen");
  }

  return (
    <div className="container-kg py-10">
      <div className="grid items-end gap-5 lg:grid-cols-[7fr_5fr]">
        <div>
          <p className="font-mono text-[13px] text-kg-text-2">
            <Link href="/" className="no-underline hover:underline">
              Home
            </Link>
            {" / Kozijnen"}
          </p>
          <h1 className="display-plp mt-3">
            Kunststof kozijnen op maat.
            <br />
            Geleverd, of gezet.
          </h1>
          <p className="mt-4 max-w-xl text-kg-text-2">
            Alleen levering vanaf 15 werkdagen. Een Caveman zet in dezelfde week. Binnen altijd wit.
          </p>
          <div className="mt-6 grid gap-3 border-y border-kg-lijn py-3 font-mono text-[14px] sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k}>
                <div className="font-medium">{k}</div>
                <div className="text-kg-text-2">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <Bevel size={24} className="relative h-[220px] lg:h-[300px]" style={{ background: "#d9d5cb" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "repeating-linear-gradient(90deg,#C9C4B8 0 8px,#D9D5CB 8px 16px)",
            }}
          />
        </Bevel>
      </div>

      <div className="mt-12 grid items-start gap-5 lg:grid-cols-[7fr_5fr]">
        <div className="flex flex-col gap-10">
          <Step n="01" title="Type">
            <div className="grid gap-3 sm:grid-cols-2">
              {KZ_TYPES.map((item, index) => {
                const active = typeIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setTypeIndex(index)}
                    className={cn(
                      "border p-4 text-left",
                      active ? "border-kg-navy bg-white" : "border-kg-lijn bg-transparent",
                    )}
                  >
                    <KozijnSchema cols={item.cols} panes={item.panes} frame="#1B2838" height={64} />
                    <div className="mt-3 text-[15px] font-medium">{item.name}</div>
                    <div className="font-mono text-[13px] text-kg-text-2">{item.detail}</div>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n="02" title="Maat">
            <div className="grid grid-cols-3 gap-3">
              <label className="font-mono text-[13px] text-kg-text-2">
                Breedte (mm)
                <input
                  type="number"
                  min={400}
                  max={3000}
                  step={10}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                  onBlur={() => setWidth(w)}
                  className="mt-1 h-10 w-full bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none"
                />
              </label>
              <label className="font-mono text-[13px] text-kg-text-2">
                Hoogte (mm)
                <input
                  type="number"
                  min={400}
                  max={3000}
                  step={10}
                  value={height}
                  onChange={(event) => setHeight(Number(event.target.value))}
                  onBlur={() => setHeight(h)}
                  className="mt-1 h-10 w-full bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none"
                />
              </label>
              <div className="font-mono text-[13px] text-kg-text-2">
                Oppervlak
                <div className="mt-1 flex h-10 items-center font-mono text-[14px] text-kg-navy">
                  {formatNlNumber(m2, 2)} m²
                </div>
              </div>
            </div>
          </Step>

          <Step n="03" title="Kleur">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {KZ_COLORS.map((item, index) => {
                const active = colorIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    className="text-left"
                  >
                    <span
                      className={cn("block h-12", active && "outline outline-2 outline-offset-2 outline-kg-navy")}
                      style={{ background: item.hex }}
                    />
                    <span className="mt-2 block text-[15px] font-medium">{item.name}</span>
                    <span className="font-mono text-[12px] text-kg-text-2">{item.code}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[13px] text-kg-text-2">Binnen altijd wit.</p>
          </Step>

          <Step n="04" title="Glas">
            <div className="grid gap-2">
              {KZ_GLASS.map((item, index) => {
                const active = glassIndex === index;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setGlassIndex(index)}
                    className={cn(
                      "flex items-center gap-3 border px-4 py-3 text-left",
                      active ? "border-kg-navy bg-white" : "border-kg-lijn",
                    )}
                  >
                    <span
                      className={cn("size-3 border border-kg-navy", active ? "bg-kg-navy" : "bg-white")}
                    />
                    <span className="flex-1 text-[15px] font-medium">{item.name}</span>
                    <span className="font-mono text-[13px] text-kg-text-2">
                      {item.detail}
                      {item.extra ? ` · +${formatPrice(item.extra)} /m²` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n="05" title="Levering of montage">
            <div className="grid gap-2">
              {[
                { n: "Alleen levering", d: "Afhalen Hedel of bezorgd op adres", p: "inbegrepen", i: 0 },
                {
                  n: "Inclusief montage door Caveman",
                  d: "Uitnemen oud kozijn, stellen, afkitten, afvoer",
                  p: formatPrice(mountPrice),
                  i: 1,
                },
              ].map((item) => {
                const active = mount === item.i;
                const caveman = active && item.i === 1;
                return (
                  <button
                    key={item.n}
                    type="button"
                    onClick={() => setMount(item.i)}
                    className={cn(
                      "flex items-start gap-3 border px-4 py-3 text-left",
                      active ? "border-kg-navy" : "border-kg-lijn",
                      caveman ? "bg-kg-navy text-kg-kalk" : "bg-white",
                    )}
                  >
                    <span
                      className="mt-1 size-3 border"
                      style={{
                        background: active ? (caveman ? "#FFD400" : "#1B2838") : "#fff",
                        borderColor: caveman ? "#FFD400" : "#1B2838",
                      }}
                    />
                    <span className="flex-1">
                      <span className="block text-[15px] font-medium">{item.n}</span>
                      <span className={cn("font-mono text-[13px]", caveman ? "text-kg-grind" : "text-kg-text-2")}>
                        {item.d}
                      </span>
                    </span>
                    <span className={cn("font-mono text-[13px]", caveman ? "text-kg-signal" : "")}>{item.p}</span>
                  </button>
                );
              })}
            </div>
          </Step>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-[130px]">
          <div className="border border-kg-lijn bg-white p-5">
            <Bevel size={16} className="relative flex aspect-[4/3] items-center justify-center bg-kg-kalk">
              <div style={{ width: `${prevW}%`, height: `${prevH}%` }}>
                <KozijnSchema cols={type.cols} panes={type.panes} frame={color.hex} height="100%" />
              </div>
            </Bevel>
            <h2 className="mt-4 text-[20px] font-bold tracking-[-0.03em]">{title}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 border-y border-kg-lijn py-3 font-mono text-[13px]">
              <Row k="Maat" v={`${w} × ${h} mm`} />
              <Row k="Profiel" v="Kömmerling 76" />
              <Row k="Kleur buiten" v={`${color.name} ${color.code}`} />
              <Row k="Glas" v={glass.name} />
              <Row k="Uitvoering" v={hasMount ? "geleverd en gezet" : "alleen levering"} />
            </dl>
            <div className="mt-3 space-y-1 font-mono text-[13px]">
              <div className="flex justify-between">
                <span>Kozijn</span>
                <span>{formatPrice(base)}</span>
              </div>
              {hasMount ? (
                <div className="flex justify-between">
                  <span>Montage door Caveman</span>
                  <span>{formatPrice(mountPrice)}</span>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-[30px] font-bold">{formatPrice(total)}</span>
              <span className="font-mono text-[13px] text-kg-text-2">excl. btw</span>
            </div>
            <p className="mt-1 font-mono text-[13px] text-kg-text-2">{lead}</p>
            <button type="button" onClick={onAdd} className={cn(buttonVariants({ variant: "primary", block: true }), "mt-4")}>
              {cta}
            </button>
            <Link
              href="/offerte"
              className={cn(buttonVariants({ variant: "outline", block: true }), "mt-2 no-underline hover:no-underline")}
            >
              Vraag offerte aan voor meerdere kozijnen
            </Link>
            <p className="mt-3 font-mono text-[13px] text-kg-text-2">
              Prijs indicatief. Maatcontrole vóór productie. Altijd binnen 24 uur bericht.
            </p>
          </div>
          <div className="bg-kg-navy p-5 text-kg-kalk">
            <div className="flex items-center gap-2 text-[15px] font-bold">
              <CavemenMark size={18} />
              Caveman inmeten?
            </div>
            <p className="mt-3 font-mono text-[13px] text-kg-grind">
              Vóór bestelling, € 95, verrekend bij montage.
            </p>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "signal" }), "mt-4 inline-flex no-underline hover:no-underline")}
            >
              Plan inmeten
            </Link>
          </div>
        </aside>
      </div>

      <section className="section-kg">
        <SectionHead title="Zo gaat het" />
        <div className="grid gap-6 border-t border-kg-lijn pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="font-mono text-[13px] text-kg-text-2">{step.k}</p>
              <h3 className="mt-2 text-[17px] font-medium">{step.n}</h3>
              <p className="mt-2 text-[15px] text-kg-text-2">{step.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3 border-b border-kg-navy pb-2">
        <span className="font-mono text-[13px]">{n}</span>
        <h2 className="text-[17px] font-medium">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-kg-text-2">{k}</dt>
      <dd className="text-right">{v}</dd>
    </>
  );
}

function KozijnSchema({
  cols,
  panes,
  frame,
  height,
}: {
  cols: string;
  panes: readonly { open: boolean }[];
  frame: string;
  height: number | string;
}) {
  return (
    <div
      className="grid gap-px p-1"
      style={{
        gridTemplateColumns: cols,
        height,
        background: frame,
        border: `2px solid ${frame}`,
      }}
    >
      {panes.map((pane, index) => (
        <div key={index} className="relative bg-[#DDE4EA]" style={{ boxShadow: pane.open ? `inset 3px 3px 0 ${frame}` : undefined }} />
      ))}
    </div>
  );
}
