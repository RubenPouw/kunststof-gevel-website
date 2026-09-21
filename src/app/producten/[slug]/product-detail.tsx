"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Bevel } from "@/components/brand/section-head";
import { CavemenMark } from "@/components/brand/marks";
import { ProductCard } from "@/components/brand/product-card";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { findVariant, neededPanels, uniqueLengths } from "@/lib/catalog/derive";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product, ProductVariant } from "@/lib/catalog/types";
import { exclVat, formatLengthMm, formatNlNumber, formatPrice } from "@/lib/format";
import { paymentMethods } from "@/lib/site";
import { weekNow, stockLabel } from "@/lib/week";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "omschrijving", label: "Omschrijving" },
  { id: "montage", label: "Montage" },
  { id: "garantie", label: "Garantie" },
  { id: "downloads", label: "Downloads" },
] as const;

const TAB_COPY: Record<(typeof TABS)[number]["id"], string> = {
  omschrijving: "",
  montage:
    "Regels min. 21 × 32 mm, hart op hart 300 mm, ventilatiespouw min. 20 mm. Start met het aluminium startprofiel, plaats de panelen in het profiel en schroef met rvs 4,5 × 40. Boor 1 mm ruimer zodat het materiaal kan werken.",
  garantie:
    "10 jaar fabrieksgarantie op kleur- en vormvastheid bij montage volgens voorschrift. Wij regelen het contact met de fabrikant.",
  downloads:
    "Montagehandleiding (PDF) · kleurenkaart · technische tekening · onderhoudsvoorschrift. Sturen we mee met de orderbevestiging, of op verzoek via chat.",
};

export function ProductDetail({
  product,
  related,
  categoryName,
}: {
  product: Product;
  related: Product[];
  categoryName: string;
}) {
  const router = useRouter();
  const fallback = getDefaultVariant(product);
  const lengths = uniqueLengths(product).filter(Boolean);
  const showLength = lengths.length > 1;
  const [colorName, setColorName] = useState(fallback.colorName);
  const [length, setLength] = useState(fallback.length);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("omschrijving");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("2.6");
  const { add, setMountGevel } = useCart();
  const week = weekNow();

  const selected: ProductVariant = useMemo(
    () => findVariant(product, colorName, length) ?? fallback,
    [colorName, fallback, length, product],
  );

  const coverage = selected.panelsPerM2;
  const area = Number(width.replace(",", ".")) * Number(height.replace(",", "."));
  const panels =
    coverage && Number.isFinite(area) && area > 0
      ? neededPanels(Number(width.replace(",", ".")), Number(height.replace(",", ".")), coverage)
      : 0;
  const unitExcl = exclVat(selected.price);
  const calcTotal = panels * unitExcl;
  const priceM2 = coverage ? unitExcl * coverage : undefined;
  const status = stockLabel(selected.inStock, week, selected.stockText);
  const skuShort = selected.sku.replace(/-3M$/, "");

  function onAdd(count = qty, goCart = true) {
    add({
      productSlug: product.slug,
      variantSku: selected.sku,
      qty: count,
      name: `${product.name}, ${selected.colorName.toLowerCase()}`,
      brand: product.brand,
      colorName: selected.colorName,
      price: selected.price,
      hex: selected.hex,
      length: selected.length,
      areaM2: coverage ? count / coverage : undefined,
      skuLabel: `Art. ${skuShort} · ${formatLengthMm(selected.length)}`,
    });
    setAdded(true);
    if (goCart) router.push("/winkelwagen");
  }

  const specs = [
    ["Werkende breedte", product.workingWidthMm ? `${product.workingWidthMm} mm` : "—"],
    ["Dikte", product.specs.find((spec) => /dikte/i.test(spec.label))?.value ?? "—"],
    ["Lengte", formatLengthMm(selected.length)],
    ["Kleur", `${selected.colorName.toLowerCase()}${selected.ral ? ` ${selected.ral}` : ""}`],
    ["Brandklasse", product.specs.find((spec) => /brand/i.test(spec.label))?.value ?? "B-s2, d0"],
  ];

  return (
    <div className="container-kg py-8 sm:py-10">
      <p className="font-mono text-[13px] text-kg-text-2">
        <Link href="/" className="no-underline hover:underline">
          Home
        </Link>
        {" / "}
        <Link href={`/${product.category}`} className="no-underline hover:underline">
          {categoryName}
        </Link>
        {" / "}
        {product.brand}
      </p>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
        <div>
          <div className="relative">
            <Bevel size={24} className="aspect-square" style={{ background: selected.hex }} />
            <span className="absolute top-4 left-4 bg-kg-kalk px-2 py-1 font-mono text-[13px]">
              {selected.colorName}
              {selected.ral ? ` · ${selected.ral}` : ""}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {product.colors.slice(0, 5).map((color) => (
              <button
                key={color.sampleId}
                type="button"
                onClick={() => setColorName(color.name)}
                className={cn(
                  "relative aspect-square",
                  color.name === selected.colorName && "outline outline-2 outline-kg-navy",
                )}
                aria-label={color.name}
              >
                <span className="absolute inset-0" style={{ background: color.hex }} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-mono text-[13px] text-kg-text-2">
            Art. {skuShort} · {product.brand}
          </p>
          <h1 className="display-pdp">
            {product.name}, {selected.colorName.toLowerCase()}, per paneel
          </h1>

          <dl className="grid grid-cols-2 gap-x-4 border-y border-kg-lijn py-3 font-mono text-[14px]">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 py-1">
                <dt className="text-kg-text-2">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[32px] leading-none font-bold">{formatPrice(unitExcl)}</p>
              <p className="mt-1 text-[14px] text-kg-text-2">
                /paneel excl. btw
                {priceM2 ? ` · ${formatPrice(priceM2)} /m²` : ""}
              </p>
            </div>
            <p className="font-mono text-[13px] whitespace-nowrap" style={{ color: status.color }}>
              {selected.inStock ? `Op voorraad · levering week ${week}` : status.text}
            </p>
          </div>

          {product.colors.length > 1 ? (
            <fieldset>
              <legend className="text-[17px] font-medium">Kies je kleur</legend>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color.sampleId}
                    type="button"
                    onClick={() => setColorName(color.name)}
                    className={cn(
                      "size-8",
                      color.name === selected.colorName && "outline outline-2 outline-offset-2 outline-kg-navy",
                    )}
                    style={{ background: color.hex }}
                    aria-label={color.name}
                    aria-pressed={color.name === selected.colorName}
                  />
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {showLength ? (
              <fieldset>
                <legend className="font-mono text-[13px] text-kg-text-2">Lengte</legend>
                <div className="mt-2 flex gap-2">
                  {lengths.map((value) => {
                    const active = selected.length === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLength(value)}
                        className={cn(
                          "h-10 min-w-[110px] border px-3 font-mono text-[14px]",
                          active ? "border-kg-navy bg-kg-navy text-kg-kalk" : "border-kg-lijn bg-transparent",
                        )}
                      >
                        {formatLengthMm(value)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            <fieldset>
              <legend className="font-mono text-[13px] text-kg-text-2">Aantal</legend>
              <div className="mt-2 flex h-10 w-[130px] items-stretch border border-kg-lijn">
                <button type="button" className="grid w-10 place-items-center" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Minder">
                  −
                </button>
                <input
                  value={qty}
                  onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
                  className="min-w-0 flex-1 border-x border-kg-lijn bg-kg-kalk text-center font-mono text-[14px]"
                  aria-label="Aantal"
                />
                <button type="button" className="grid w-10 place-items-center" onClick={() => setQty((n) => n + 1)} aria-label="Meer">
                  +
                </button>
              </div>
            </fieldset>
          </div>

          {coverage ? (
            <div className="border border-kg-lijn bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="font-mono text-[13px] text-kg-text-2">
                  Breedte (m)
                  <input
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    inputMode="decimal"
                    className="mt-1 h-10 w-full bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none"
                  />
                </label>
                <label className="font-mono text-[13px] text-kg-text-2">
                  Hoogte (m)
                  <input
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    inputMode="decimal"
                    className="mt-1 h-10 w-full bg-kg-kalk px-3 font-mono text-[14px] text-kg-navy outline-none"
                  />
                </label>
              </div>
              {panels > 0 ? (
                <p className="mt-3 font-mono text-[14px]">
                  {formatNlNumber(area, 1)} m² → {panels} panelen van {formatLengthMm(selected.length)} ·{" "}
                  {formatPrice(calcTotal)} excl. btw
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => panels > 0 && setQty(panels)}
                disabled={panels < 1}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3")}
              >
                Neem over
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onAdd()}
              disabled={!selected.inStock}
              className={cn(buttonVariants({ variant: "primary" }), "h-12 flex-1")}
            >
              In bestelling · {formatPrice(unitExcl * qty)}
            </button>
            {product.sampleable ? (
              <SampleAddButton
                sample={{
                  id: selected.sampleId,
                  brandSlug: product.brandSlug,
                  brandName: product.brand,
                  colorName: selected.colorName,
                  hex: selected.hex,
                  ral: selected.ral,
                }}
                label="Gratis staal"
                className="h-12"
              />
            ) : null}
            <button
              type="button"
              onClick={() => {
                onAdd(qty, false);
                setMountGevel(true);
                router.push("/winkelwagen");
              }}
              className="flex h-12 items-center gap-2 px-3 text-[15px] font-medium text-kg-text-2"
            >
              <CavemenMark size={14} mono fill="#4A5568" />
              Caveman erbij
            </button>
          </div>
          {added ? (
            <p className="font-mono text-[13px] text-kg-stock">
              Toegevoegd. <Link href="/winkelwagen">Naar winkelwagen</Link>
            </p>
          ) : (
            <p className="font-mono text-[13px] text-kg-text-2">
              10 jaar garantie · {paymentMethods.join(" · ")}
            </p>
          )}
        </div>
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap gap-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "h-10 px-4 text-[14px] font-medium",
                tab === item.id ? "bg-kg-navy text-kg-kalk" : "text-kg-text-2",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <p className="text-[15px] leading-[1.5] text-kg-text-2">
            {tab === "omschrijving" ? product.description : TAB_COPY[tab]}
          </p>
          <div className="border border-kg-lijn bg-white p-5 font-mono text-[14px]">
            <p className="font-medium">Levering en retour</p>
            <p className="mt-2 text-kg-text-2">
              Levering week {week} bij voorraad. Retour binnen 14 dagen, ongeopend. Panelen op maat uitgesloten.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16 mb-8">
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">Hoort erbij</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-0 z-30 -mx-6 mt-10 border-t border-kg-lijn bg-white px-6 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => onAdd()}
          disabled={!selected.inStock}
          className={cn(buttonVariants({ variant: "primary", block: true }))}
        >
          In bestelling · {formatPrice(unitExcl * qty)}
        </button>
      </div>
    </div>
  );
}
