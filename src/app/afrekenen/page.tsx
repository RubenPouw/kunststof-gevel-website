"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActionState } from "react";

import { beginCheckout } from "@/app/afrekenen/actions";
import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_FROM, resolveCartLine, SHIPPING_FLAT, useCart } from "@/lib/cart";
import { formatPrice, roundMoney } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { lines, subtotal, remainingForFreeShipping, mountGevel, mountPrice } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : lines.length ? SHIPPING_FLAT : 0;
  const mount = mountGevel ? mountPrice : 0;
  const net = subtotal + mount + shipping;
  const vat = roundMoney(net * 0.21);
  const totalIncl = roundMoney(net + vat);
  const [customerType, setCustomerType] = useState<"particulier" | "zakelijk">("particulier");
  const [state, action, pending] = useActionState(beginCheckout, { error: null, checkoutUrl: null });

  useEffect(() => {
    if (state.checkoutUrl) window.location.assign(state.checkoutUrl);
  }, [state.checkoutUrl]);

  if (lines.length === 0) {
    return (
      <div className="container-kg max-w-3xl py-12">
        <h1>Afrekenen</h1>
        <p className="mt-4">Uw winkelwagen is leeg.</p>
        <Link href="/winkelwagen" className="mt-4 inline-block">
          Terug naar winkelwagen
        </Link>
      </div>
    );
  }

  return (
    <div className="container-kg max-w-3xl py-12">
      <p className="font-mono text-[13px] text-kg-text-2">Afrekenen</p>
      <h1 className="mt-2">Gegevens</h1>
      <p className="mt-2 font-mono text-[13px] text-kg-text-2">
        Winkelwagen / Gegevens / Betalen
      </p>

      <form action={action} className="mt-8 grid gap-8">
        <input
          type="hidden"
          name="lines"
          value={JSON.stringify(
            lines.map((line) => ({
              productSlug: line.productSlug,
              variantSku: line.variantSku,
              quantity: line.qty,
              shopifyVariantId: line.shopifyVariantId,
              kind: line.kind,
            })),
          )}
        />
        <input type="hidden" name="montage" value={mountGevel ? "1" : "0"} />
        <div className="flex gap-2">
          {(["particulier", "zakelijk"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCustomerType(type)}
              className={cn(
                "min-h-11 px-4 text-[14px] font-semibold capitalize",
                customerType === type
                  ? "bg-kg-ink text-white"
                  : "border border-[var(--color-border-strong)] bg-surface",
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid gap-4 bg-surface p-5 sm:grid-cols-2">
          <Field label="Naam" name="name" autoComplete="name" />
          <Field label="E-mail" name="email" type="email" autoComplete="email" />
          <Field label="Telefoon" name="phone" type="tel" autoComplete="tel" />
          <Field label="Adres" name="address" autoComplete="street-address" />
          <Field label="Postcode" name="postcode" autoComplete="postal-code" />
          <Field label="Plaats" name="city" autoComplete="address-level2" />
          {customerType === "zakelijk" ? (
            <>
              <Field label="Bedrijf" name="company" autoComplete="organization" />
              <Field label="KvK" name="kvk" />
            </>
          ) : null}
        </div>

        {state.error ? (
          <p className="border border-kg-ink bg-surface px-4 py-3 text-[13px] text-kg-ink" role="alert">
            {state.error}
          </p>
        ) : null}

        <aside className="bg-kg-offwhite p-5">
          <h2 className="text-[22px]">Samenvatting</h2>
          <ul className="mt-3 space-y-2 text-[14px]">
            {lines.map((line) => {
              const resolved = resolveCartLine(line);
              if (!resolved) return null;
              return (
                <li key={line.variantSku} className="flex justify-between gap-4">
                  <span>
                    {resolved.name} · {resolved.colorName} · {line.variantSku} × {line.qty}
                  </span>
                  <span className="font-mono text-[16px] font-bold">
                    {formatPrice(resolved.unitExcl * line.qty)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[13px] font-semibold text-brand">
            {remainingForFreeShipping > 0
              ? `Nog ${formatPrice(remainingForFreeShipping)} tot gratis verzending`
              : "Gratis verzending"}
          </p>
          <div className="mt-4 flex items-baseline justify-between">
            <span>Totaal incl. btw</span>
            <span className="font-mono text-[28px] font-bold">{formatPrice(totalIncl)}</span>
          </div>
          <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary", block: true }), "mt-5")}>
            {pending ? "Checkout starten…" : "Naar de beveiligde checkout"}
          </button>
          <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
            U betaalt bij Shopify. Er is pas een bestelling als die betaling lukt. Het bedrag daar is leidend, inclusief btw. Montage zit niet in deze betaling.
          </p>
          <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
            <Link href="/algemene-voorwaarden">Voorwaarden</Link>
            {" · "}
            <Link href="/privacy">Privacy</Link>
            {" · "}
            <Link href="/herroepingsrecht">Herroepingsrecht</Link>
            {" · "}
            <a href={site.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {site.mobileDisplay}
            </a>
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="min-h-11 border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal outline-none focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)]"
      />
    </label>
  );
}
