"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ShippingEstimate, VatPrice } from "@/components/brand/vat-price";
import { AreaCalculator } from "@/components/catalog/area-calculator";
import { SheetCalculator } from "@/components/catalog/sheet-calculator";
import { ProductCard } from "@/components/brand/product-card";
import { ProductPhoto } from "@/components/brand/product-photo";
import { ColourName } from "@/components/catalog/colour-name";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { findVariant, uniqueLengths } from "@/lib/catalog/derive";
import { describeMeasure, isRealListedLength } from "@/lib/catalog/measures";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product, ProductVariant } from "@/lib/catalog/types";
import { productHasPrice, profileRole } from "@/lib/catalog/helpers";
import { exclVat, formatLengthMm, formatPrice } from "@/lib/format";
import { confirmedLeadTimeWeeks, leadTimeLabel } from "@/lib/lead-time";
import { productAlt } from "@/lib/seo/alt";
import { stockLabel } from "@/lib/week";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "omschrijving", label: "Omschrijving" },
  { id: "montage", label: "Montage" },
  { id: "garantie", label: "Garantie" },
  { id: "downloads", label: "Downloads" },
] as const;

function tabCopy(sheet: boolean, id: (typeof TABS)[number]["id"]) {
  if (id === "omschrijving") return "";
  if (sheet) {
    if (id === "montage") {
      return "Buiten komt de plaat op een geventileerde achterconstructie. Kit de spouw niet dicht. Bevestig volgens het voorschrift van de lijn. Wij leveren de plaat heel, 3050 × 1300 × 6 mm, en zagen niet op maat.";
    }
    if (id === "garantie") {
      return "Garantie volgt het voorschrift van de productlijn. Wij noemen geen termijn die niet op het artikel staat.";
    }
    return "Een montageblad sturen we op verzoek, als de lijn dat document heeft. Vraag het via de telefoon of de mail, dan kijken we welk blad bij deze plaat hoort.";
  }
  if (id === "montage") {
    return "Regels min. 21 × 32 mm, hart op hart 300 mm, ventilatiespouw min. 20 mm. Start met het aluminium startprofiel, plaats de panelen in het profiel en schroef met rvs 4,5 × 40. Boor 1 mm ruimer zodat het materiaal kan werken.";
  }
  if (id === "garantie") {
    return "10 jaar fabrieksgarantie op kleur- en vormvastheid bij montage volgens voorschrift. Wij regelen het contact met de fabrikant.";
  }
    return "";
}

export function ProductDetail({
  product,
  related,
  categoryName,
  staalHref,
}: {
  product: Product;
  related: Product[];
  categoryName: string;
  staalHref?: string;
}) {
  const router = useRouter();
  const fallback = getDefaultVariant(product);
  const lengths = uniqueLengths(product).filter((value) => isRealListedLength(value));
  const showLength = lengths.length > 1;
  const [colorName, setColorName] = useState(fallback.colorName);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [length, setLength] = useState(fallback.length);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("omschrijving");
  const { add } = useCart();

  const selected: ProductVariant = useMemo(
    () => findVariant(product, colorName, length) ?? fallback,
    [colorName, fallback, length, product],
  );

  const mainImage =
    product.images.find((image) => image.url === imageUrl) ?? selected.image ?? product.images[0];

  function chooseColor(name: string) {
    setColorName(name);
    setImageUrl(null);
  }

  const sheet = product.saleUnit === "sheet";
  const coverage = sheet ? undefined : selected.panelsPerM2;
  const canBuy = productHasPrice(product) && selected.price > 0;
  const unitExcl = exclVat(selected.price);
  const priceM2Excl = canBuy && coverage ? unitExcl * coverage : undefined;
  const priceM2Incl = canBuy && coverage ? selected.price * coverage : undefined;
  const sheetM2Excl = canBuy && sheet && product.sheetM2 ? unitExcl / product.sheetM2 : undefined;
  const sheetM2Incl = canBuy && sheet && product.sheetM2 ? selected.price / product.sheetM2 : undefined;
  const status = stockLabel(selected.inStock, selected.stockText);
  const skuShort = selected.sku.replace(/-3M$/, "");
  const measure = describeMeasure(product.name, selected.length, product.workingWidthMm);
  const measureText =
    measure.text === "Stuk" ? "per stuk" : measure.label === "Lengte" ? measure.text : `${measure.label} ${measure.text}`;

  function onAdd(count = qty, goCart = true) {
    if (!canBuy) return;
    add({
      productSlug: product.slug,
      variantSku: selected.sku,
      qty: count,
      name: `${product.name}, ${selected.colorName.toLowerCase()}`,
      brand: product.brand,
      colorName: selected.colorName,
      price: selected.price,
      shopifyVariantId: selected.shopifyVariantId,
      hex: selected.hex,
      image: (selected.image ?? product.images[0])?.url,
      length: selected.length,
      areaM2: coverage ? count / coverage : undefined,
      skuLabel: `Art. ${skuShort} · ${measureText}`,
    });
    setAdded(true);
    if (goCart) router.push("/winkelwagen");
  }

  const specs = sheet
    ? [
        ["Afmeting", "3050 × 1300 mm"],
        ["Dikte", "6 mm"],
        ["Per plaat", "3,965 m²"],
        ["Zaagwerk", "Nee, hele plaat"],
        ["Lijn", product.brand],
        ["Kleur", selected.colorName],
        ["RAL", selected.ral ?? ""],
      ].filter((row): row is [string, string] => Boolean(row[1]))
    : [
        ["Werkende breedte", measure.label === "Werkende breedte" ? "" : product.workingWidthMm ? `${product.workingWidthMm} mm` : ""],
        ["Dikte", product.specs.find((spec) => /dikte/i.test(spec.label))?.value ?? ""],
        [measure.label, measure.text === "Stuk" ? "" : measure.text],
        ["Kleur", `${selected.colorName}${selected.ral ? ` ${selected.ral}` : ""}`],
        ["Brandklasse", product.specs.find((spec) => /brand/i.test(spec.label))?.value ?? ""],
      ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="container-kg py-8 sm:py-10">
      <nav aria-label="Kruimelpad" className="font-mono text-[13px] text-kg-text-2">
        <Link href="/" className="no-underline hover:underline">
          Home
        </Link>
        {" / "}
        <Link href={`/${product.category}`} className="no-underline hover:underline">
          {categoryName}
        </Link>
        {" / "}
        <Link href={`/merken/${product.brandSlug}`} className="no-underline hover:underline">
          {product.brand}
        </Link>
      </nav>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
        <div>
          <div className="relative">
            <ProductPhoto
              image={mainImage}
              alt={productAlt(product, selected.colorName)}
              sizes="(min-width: 1024px) 600px, 100vw"
              fallback={selected.hex}
              bevel={24}
              priority
              className="aspect-square border border-kg-lijn"
              imageClassName="p-4"
            />
            <span className="absolute top-4 left-4 bg-kg-kalk px-2 py-1 font-mono text-[13px]">
              <ColourName value={selected.colorName} />
              {selected.ral ? ` · ${selected.ral}` : ""}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {product.images.length > 1
              ? product.images.slice(0, 10).map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setImageUrl(image.url)}
                    className={cn(
                      "border border-kg-lijn",
                      image.url === mainImage?.url && "outline outline-2 outline-offset-1 outline-kg-navy",
                    )}
                    aria-label={`Foto ${index + 1} van ${product.images.length}`}
                    aria-pressed={image.url === mainImage?.url}
                  >
                    <ProductPhoto
                      image={image}
                      alt={productAlt(product, `foto ${index + 1}`)}
                      sizes="120px"
                      bevel={null}
                      className="aspect-square"
                      imageClassName="p-1"
                    />
                  </button>
                ))
              : null}
            {product.images.length === 0
              ? product.colors.slice(0, 5).map((color) => (
                  <button
                    key={color.sampleId}
                    type="button"
                    onClick={() => chooseColor(color.name)}
                    className={cn(
                      "relative aspect-square",
                      color.name === selected.colorName && "outline outline-2 outline-kg-navy",
                    )}
                    aria-label={color.name}
                  >
                    <span className="absolute inset-0" style={{ background: color.hex }} />
                  </button>
                ))
              : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-mono text-[13px] text-kg-text-2">
            Art. {skuShort} · {product.brand}
          </p>
          <h1 className="display-pdp">{product.name}</h1>

          <dl className="grid grid-cols-2 gap-x-4 border-y border-kg-lijn py-3 font-mono text-[14px]">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 py-1">
                <dt className="text-kg-text-2">{label}</dt>
                <dd>{label === "Kleur" ? <ColourName value={value} /> : value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[32px] leading-none font-bold">
                {canBuy ? <VatPrice incl={selected.price} excl={unitExcl} labeled={false} /> : "Prijs op aanvraag"}
              </p>
              <p className="mt-1 text-[14px] text-kg-text-2">
                {canBuy ? (
                  sheet ? (
                    <span className="kg-vat">
                      <span className="kg-vat-incl">
                        incl. btw /plaat
                        {sheetM2Incl ? ` · ${formatPrice(sheetM2Incl)} /m² incl. btw op de hele plaat` : ""}
                      </span>
                      <span className="kg-vat-excl">
                        excl. btw /plaat
                        {sheetM2Excl ? ` · ${formatPrice(sheetM2Excl)} /m² excl. btw op de hele plaat` : ""}
                      </span>
                    </span>
                  ) : (
                    <span className="kg-vat">
                      <span className="kg-vat-incl">
                        incl. btw /paneel
                        {priceM2Incl ? ` · ${formatPrice(priceM2Incl)} /m² incl. btw` : ""}
                      </span>
                      <span className="kg-vat-excl">
                        excl. btw /paneel
                        {priceM2Excl ? ` · ${formatPrice(priceM2Excl)} /m² excl. btw` : ""}
                      </span>
                    </span>
                  )
                ) : (
                  "Niet online te bestellen"
                )}
              </p>
              <p className="mt-2 text-[14px] text-kg-text-2">
                <ShippingEstimate />
              </p>
            </div>
            <p className="font-mono text-[13px] whitespace-nowrap" style={{ color: status.color }}>
              {leadTimeLabel(selected.inStock ? null : confirmedLeadTimeWeeks(product.category, product.slug), status.text)}
            </p>
          </div>

          {product.colors.length > 1 ? (
            <fieldset>
              <legend className="text-[17px] font-medium">Kies je kleur · {product.colors.length} kleuren</legend>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color.sampleId}
                    type="button"
                    onClick={() => chooseColor(color.name)}
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

          {sheet ? (
            <SheetCalculator
              sheetM2={product.sheetM2}
              colourLabel={selected.colorName}
              unitExcl={canBuy ? unitExcl : 0}
              onTake={(count) => setQty(count)}
              onOrder={(count) => onAdd(count)}
            />
          ) : coverage ? (
            <AreaCalculator
              panelsPerM2={coverage}
              lengthLabel={formatLengthMm(selected.length)}
              colourLabel={selected.colorName}
              unitExcl={canBuy ? unitExcl : 0}
              assumedLength={Boolean(selected.lengthAssumed)}
              onTake={(panels) => setQty(panels)}
              onOrder={(panels) => onAdd(panels)}
            />
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {canBuy ? (
              <button
                type="button"
                onClick={() => onAdd()}
                disabled={!selected.inStock}
                className={cn(buttonVariants({ variant: "primary" }), "h-12 flex-1")}
              >
                In bestelling · <VatPrice incl={selected.price * qty} excl={unitExcl * qty} />
              </button>
            ) : (
              <Link href="/offerte" className={cn(buttonVariants({ variant: "primary" }), "h-12 flex-1 no-underline")}>
                Vraag de prijs
              </Link>
            )}
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
                label="Staal"
                className="h-12"
              />
            ) : null}
            <Link href="/offerte" className="flex h-12 items-center px-3 text-[15px] font-medium text-kg-text-2">
              Montage via offerte
            </Link>
            {staalHref ? (
              <Link href={staalHref} className="flex h-12 items-center px-3 text-[15px] font-medium">
                Gratis staalaanvraag
              </Link>
            ) : null}
          </div>
          {added ? (
            <p className="font-mono text-[13px] text-kg-stock">
              Toegevoegd. <Link href="/winkelwagen">Naar winkelwagen</Link>
            </p>
          ) : (
            <p className="font-mono text-[13px] text-kg-text-2">
              {sheet
                ? "Hele plaat. Je zaagwerk doen wij niet. Levering in max. 4 werkdagen."
                : "10 jaar garantie op kleur, volgens het merkvoorschrift. Levering in max. 4 werkdagen."}
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
          <div className="text-[15px] leading-[1.5] text-kg-text-2">
            {tab === "downloads" ? (
              product.downloads && product.downloads.length > 0 ? (
                <ul className="space-y-2">
                  {product.downloads.map((file) => (
                    <li key={file.href}>
                      <a href={file.href}>{file.label}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Voor dit artikel staat geen montagehandleiding of prestatieverklaring online.</p>
              )
            ) : tab === "omschrijving" ? (
              product.description ? <p>{product.description}</p> : <p>Geen omschrijving bij dit artikel.</p>
            ) : (
              <p>{tabCopy(sheet, tab)}</p>
            )}
          </div>
          <div className="border border-kg-lijn bg-white p-5 font-mono text-[14px]">
            <p className="font-medium">Levering en retour</p>
            <p className="mt-2 text-kg-text-2">
              Levertijd bevestigen we na bestelling. Retour binnen 14 dagen als het artikel ongewijzigd is.{" "}
              {sheet ? "Wij zagen de plaat niet. " : "Panelen op maat zijn uitgesloten. "}
              Zie{" "}
              <Link href="/verzenden-retour">verzenden en retour</Link>.
            </p>
          </div>
        </div>
      </section>

      {product.category === "gevelbekleding" && related.length > 0 ? (
        <RelatedProfiles related={related} />
      ) : related.length > 0 ? (
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
          onClick={() => (canBuy ? onAdd() : router.push("/offerte"))}
          disabled={canBuy && !selected.inStock}
          className={cn(buttonVariants({ variant: "primary", block: true }))}
        >
          {canBuy ? (
            <>
              In bestelling · <VatPrice incl={selected.price * qty} excl={unitExcl * qty} />
            </>
          ) : (
            "Vraag de prijs"
          )}
        </button>
      </div>
    </div>
  );
}

function RelatedProfiles({ related }: { related: Product[] }) {
  const noodzakelijk = related.filter((item) => profileRole(item) === "noodzakelijk");
  const aanbevolen = related.filter((item) => profileRole(item) !== "noodzakelijk");
  const groups = [
    { title: "Noodzakelijk", items: noodzakelijk },
    { title: "Aanbevolen", items: aanbevolen },
  ].filter((group) => group.items.length > 0);
  if (!groups.length) return null;
  return (
    <div className="mt-16 mb-8 space-y-10">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">{group.title}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {group.items.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
