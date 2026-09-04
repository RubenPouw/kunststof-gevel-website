"use client";

import Link from "next/link";

import { SegmentBar } from "@/components/brand/segment-bar";
import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_FROM, useCart } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, remainingForFreeShipping } = useCart();

  return (
    <div className="container-kg max-w-3xl py-12">
      <p className="kicker">Afrekenen</p>
      <h1 className="mt-2">Winkelwagen</h1>
      <SegmentBar size={32} progress={1} className="mt-6" />
      <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
        Winkelwagen / Gegevens / Betalen
      </p>

      {lines.length === 0 ? (
        <div className="mt-10 border border-[var(--color-border)] bg-surface p-8">
          <p>Uw winkelwagen is leeg.</p>
          <Link href="/gevelbekleding" className={buttonVariants({ variant: "secondary" }) + " mt-6 inline-flex"}>
            Bekijk producten
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-surface">
            {lines.map((line) => {
              const product = getProduct(line.productSlug);
              if (!product) return null;
              return (
                <li key={`${line.productSlug}-${line.colorName}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="kicker">{product.brand}</p>
                    <p className="mt-1 font-heading text-[18px] font-semibold">{product.name}</p>
                    <p className="text-[13px] text-[var(--color-text-muted)]">{line.colorName}</p>
                    <button
                      type="button"
                      onClick={() => remove(line.productSlug, line.colorName)}
                      className="mt-2 text-[13px] text-brand underline"
                    >
                      Verwijderen
                    </button>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="font-heading text-2xl font-bold">
                      {formatPrice(product.price * line.qty)}
                    </p>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(event) =>
                        setQty(line.productSlug, line.colorName, Math.max(1, Number(event.target.value) || 1))
                      }
                      className="h-11 w-16 border border-[var(--color-border-strong)] bg-surface px-2"
                      aria-label={`Aantal ${product.name}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="mt-6 bg-kg-offwhite p-5">
            <p className="text-[13px] font-semibold text-brand">
              {remainingForFreeShipping > 0
                ? `Nog ${formatPrice(remainingForFreeShipping)} tot gratis verzending`
                : "Gratis verzending"}
            </p>
            <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
              Gratis verzending vanaf {formatPrice(FREE_SHIPPING_FROM)}
            </p>
            <div className="mt-4 flex items-baseline justify-between">
              <span>Totaal incl. btw</span>
              <span className="font-heading text-[28px] font-bold">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/afrekenen" className={buttonVariants({ variant: "primary", block: true }) + " mt-5"}>
              Verder naar betalen
            </Link>
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              Altijd binnen 24 uur bericht · Vragen?{" "}
              <a href={site.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </p>
          </aside>
        </>
      )}
    </div>
  );
}
