"use client";

import Link from "next/link";

import { ProductPhoto } from "@/components/brand/product-photo";
import { ShippingEstimate, VatPrice } from "@/components/brand/vat-price";
import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_FROM, resolveCartLine, SHIPPING_FLAT, useCart } from "@/lib/cart";
import { formatLengthMm, formatNlNumber, formatPrice, inclVat } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const {
    lines,
    setQty,
    remove,
    subtotal,
    remainingForFreeShipping,
    mountGevel,
    setMountGevel,
    gevelM2,
    mountPrice,
  } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : lines.length ? SHIPPING_FLAT : 0;
  const mount = mountGevel ? mountPrice : 0;
  const net = subtotal + mount + shipping;
  const vat = inclVat(net) - net;
  const totalIncl = inclVat(net);

  return (
    <div className="container-kg py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[8fr_4fr]">
        <div>
          <h1 className="display-pdp">Winkelwagen · {lines.length} regels</h1>

          {lines.length === 0 ? (
            <div className="mt-8 border border-kg-lijn bg-white p-8">
              <p>Uw winkelwagen is leeg.</p>
              <Link
                href="/gevelbekleding"
                className={cn(buttonVariants({ variant: "primary" }), "mt-6 inline-flex no-underline hover:no-underline")}
              >
                Bekijk voorraad
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <div className="hidden border-b border-kg-navy pb-2 font-mono text-[13px] text-kg-text-2 sm:grid sm:grid-cols-[2fr_0.7fr_0.9fr_1.4fr]">
                <span>Artikel</span>
                <span className="text-right">Aantal</span>
                <span className="text-right">Prijs</span>
                <span className="text-right">Levering</span>
              </div>
              <ul>
                {lines.map((line) => {
                  const resolved = resolveCartLine(line);
                  if (!resolved) return null;
                  const lead =
                    resolved.kind === "kozijn" || !resolved.inStock ? "Levertijd in overleg" : "Op voorraad";
                  const leadColor = resolved.kind === "kozijn" || !resolved.inStock ? "var(--kg-navy)" : "var(--kg-stock)";
                  return (
                    <li
                      key={line.variantSku}
                      className="grid items-center gap-3 border-b border-kg-lijn py-4 sm:grid-cols-[2fr_0.7fr_0.9fr_1.4fr]"
                    >
                      <div className="flex items-center gap-3">
                        <ProductPhoto
                          image={resolved.image ? { url: resolved.image, alt: resolved.name } : undefined}
                          alt={resolved.name}
                          sizes="56px"
                          fallback={resolved.hex}
                          bevel={8}
                          className="size-14 shrink-0 border border-kg-lijn"
                        />
                        <div>
                          <p className="text-[15px] font-medium">{resolved.name}</p>
                          <p className="font-mono text-[13px] text-kg-text-2">
                            {resolved.skuLabel}
                            {resolved.length && resolved.kind === "product"
                              ? ` · ${formatLengthMm(resolved.length)}`
                              : ""}
                          </p>
                          <button
                            type="button"
                            onClick={() => remove(line.variantSku)}
                            className="mt-1 font-mono text-[12px] text-kg-text-2 underline"
                          >
                            Verwijderen
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(event) =>
                          setQty(line.variantSku, Math.max(1, Number(event.target.value) || 1))
                        }
                        className="h-10 w-16 justify-self-end bg-kg-kalk px-2 text-right font-mono text-[14px]"
                        aria-label={`Aantal ${resolved.name}`}
                      />
                      <p className="text-right font-mono text-[14px] tabular-nums">
                        <VatPrice
                          incl={inclVat(resolved.unitExcl * line.qty)}
                          excl={resolved.unitExcl * line.qty}
                        />
                      </p>
                      <p
                        className="text-right font-mono text-[13px] whitespace-nowrap"
                        style={{ color: leadColor }}
                      >
                        {lead}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-5 bg-kg-navy p-6 text-kg-kalk sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[13px] text-kg-grind">Montage</p>
              <h2 className="mt-3 text-[22px] font-bold tracking-[-0.03em]">Materiaal geregeld. Handen erbij?</h2>
              <p className="mt-2 font-mono text-[13px] text-kg-grind">
                {gevelM2
                  ? (
                    <>
                      {formatNlNumber(gevelM2, 1)} m² gevelbekleding in uw winkelwagen · montage{" "}
                      <VatPrice incl={inclVat(mountPrice)} excl={mountPrice} />
                    </>
                  )
                  : "Geen montage-artikelen in uw winkelwagen"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-[240px]">
              <button
                type="button"
                onClick={() => setMountGevel(false)}
                className={cn(
                  "h-11 border px-3 text-left text-[14px] font-medium",
                  !mountGevel
                    ? "border-kg-signal bg-kg-signal text-kg-navy"
                    : "border-kg-grind bg-transparent text-kg-kalk",
                )}
              >
                Alleen levering
              </button>
              <button
                type="button"
                onClick={() => setMountGevel(true)}
                disabled={!gevelM2}
                className={cn(
                  "h-11 border px-3 text-left text-[14px] font-medium disabled:opacity-45",
                  mountGevel
                    ? "border-kg-signal bg-kg-signal text-kg-navy"
                    : "border-kg-grind bg-transparent text-kg-kalk",
                )}
              >
                Montage via offerte
                {gevelM2 ? (
                  <>
                    {" · "}
                    {formatNlNumber(gevelM2, 1)} m², <VatPrice incl={inclVat(mountPrice)} excl={mountPrice} />
                  </>
                ) : (
                  ""
                )}
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit border border-kg-lijn bg-white p-6 lg:sticky lg:top-[170px]">
          <h2 className="font-mono text-[13px] text-kg-text-2">Overzicht</h2>
          <p className="mt-3 text-[14px] text-kg-text-2">
            <ShippingEstimate />
          </p>
          <dl className="mt-4 space-y-2 font-mono text-[14px]">
            <div className="flex justify-between gap-3">
              <dt>Materiaal</dt>
              <dd>
                <VatPrice incl={inclVat(subtotal)} excl={subtotal} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Montage</dt>
              <dd>{mount ? <VatPrice incl={inclVat(mount)} excl={mount} /> : "nee"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Verzending</dt>
              <dd>{shipping ? <VatPrice incl={inclVat(shipping)} excl={shipping} /> : "gratis"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>
                <span className="kg-vat">
                  <span className="kg-vat-incl">Waarvan btw 21%</span>
                  <span className="kg-vat-excl">Btw 21%</span>
                </span>
              </dt>
              <dd>{formatPrice(vat)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-kg-lijn pt-4">
            <span className="text-[15px]">
              <span className="kg-vat">
                <span className="kg-vat-incl">Totaal incl. btw</span>
                <span className="kg-vat-excl">Totaal excl. btw</span>
              </span>
            </span>
            <span className="font-mono text-[28px] font-bold">
              <VatPrice incl={totalIncl} excl={net} labeled={false} />
            </span>
          </div>
          <p className="kg-vat-excl mt-2 font-mono text-[13px] text-kg-text-2">
            Totaal incl. 21% btw {formatPrice(totalIncl)}
          </p>
          {remainingForFreeShipping > 0 && lines.length > 0 ? (
            <p className="mt-2 font-mono text-[13px] text-kg-text-2">
              Nog <VatPrice incl={inclVat(remainingForFreeShipping)} excl={remainingForFreeShipping} /> tot gratis
              verzending
            </p>
          ) : null}
          <Link
            href="/afrekenen"
            className={cn(
              buttonVariants({ variant: "primary", block: true }),
              "mt-5 no-underline hover:no-underline",
              lines.length === 0 && "pointer-events-none opacity-45",
            )}
          >
            Naar bestellen
          </Link>
          <Link
            href="/offerte"
            className={cn(buttonVariants({ variant: "outline", block: true }), "mt-2 no-underline hover:no-underline")}
          >
            Bewaar als offerte
          </Link>
          <p className="mt-4 font-mono text-[13px] text-kg-text-2">
            Levertijd bevestigen we na bestelling. Betalen doet u in de Shopify-checkout. Montage zit niet in dat bedrag.
          </p>
        </aside>
      </div>
    </div>
  );
}
