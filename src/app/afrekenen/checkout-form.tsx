"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActionState } from "react";

import { beginCheckout } from "@/app/afrekenen/actions";
import { buttonVariants } from "@/components/ui/button";
import { FREE_SHIPPING_FROM, resolveCartLine, SHIPPING_FLAT, useCart } from "@/lib/cart";
import { formatPrice, roundMoney, shippingEstimateCopy } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CheckoutForm({ klarna, riverty }: { klarna: boolean; riverty: boolean }) {
  const { lines, subtotal, remainingForFreeShipping, mountGevel, mountPrice } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : lines.length ? SHIPPING_FLAT : 0;
  const mount = mountGevel ? mountPrice : 0;
  const net = subtotal + mount + shipping;
  const vat = roundMoney(net * 0.21);
  const totalIncl = roundMoney(net + vat);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerType, setCustomerType] = useState<"particulier" | "zakelijk">("particulier");
  const [pickup, setPickup] = useState(false);
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
      <p className="font-mono text-[13px] text-kg-text-2">Stap {step} van 2</p>
      <h1 className="mt-2">{step === 1 ? "Gegevens" : "Levering"}</h1>
      <p className="mt-2 text-[15px] text-kg-text-2">U rekent af zonder account.</p>

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
        <input type="hidden" name="customerType" value={customerType} />
        <input type="hidden" name="pickup" value={pickup ? "1" : "0"} />

        <div className={step === 1 ? "grid gap-8" : "hidden"}>
            <div className="flex gap-2">
              {(["particulier", "zakelijk"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCustomerType(type)}
                  className={cn(
                    "min-h-11 px-4 text-[14px] font-semibold capitalize",
                    customerType === type ? "bg-kg-ink text-white" : "border border-kg-lijn bg-white",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid gap-4 bg-white p-5 sm:grid-cols-2">
              <Field label="Naam" name="name" autoComplete="name" />
              <Field label="E-mail" name="email" type="email" autoComplete="email" />
              <Field label="Telefoon" name="phone" type="tel" autoComplete="tel" />
              {customerType === "zakelijk" ? (
                <>
                  <Field label="Bedrijf" name="company" autoComplete="organization" />
                  <Field label="KvK" name="kvk" />
                  <Field label="Btw-nummer" name="btw" />
                </>
              ) : null}
            </div>
            <button type="button" className={buttonVariants({ variant: "primary" })} onClick={() => setStep(2)}>
              Verder naar levering
            </button>
        </div>
        {step === 2 ? (
          <>
            <div className="grid gap-4 bg-white p-5">
              <label className="flex min-h-11 items-center gap-3 text-[15px]">
                <input type="checkbox" checked={pickup} onChange={(event) => setPickup(event.target.checked)} />
                Afhalen in Utrecht, op afspraak
              </label>
              {pickup ? null : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Adres" name="address" autoComplete="street-address" />
                  <Field label="Postcode" name="postcode" autoComplete="postal-code" />
                  <Field label="Plaats" name="city" autoComplete="address-level2" />
                </div>
              )}
              <Field label="Referentie" name="reference" required={false} />
              <Field label="Gewenste leverdatum" name="deliveryDate" type="date" required={false} />
              <fieldset>
                <legend className="text-[14px] font-semibold">Betalen</legend>
                <div className="mt-2 grid gap-2">
                  <PayOption name="checkout" label="Betalen in de checkout" defaultChecked />
                  {customerType === "zakelijk" ? <PayOption name="rekening" label="Op rekening" /> : null}
                  {klarna ? <PayOption name="klarna" label="Klarna" /> : null}
                  {riverty ? <PayOption name="riverty" label="Riverty, achteraf betalen" /> : null}
                </div>
              </fieldset>
            </div>

            {state.error ? (
              <p className="border border-kg-navy bg-white px-4 py-3 text-[14px] text-kg-navy" role="alert">
                {state.error}
              </p>
            ) : null}

            <aside className="border border-kg-lijn bg-kg-kalk p-5">
              <h2 className="text-[22px]">Samenvatting</h2>
              <p className="mt-2 text-[14px] text-kg-text-2">{shippingEstimateCopy()}</p>
              <ul className="mt-3 space-y-2 text-[14px]">
                {lines.map((line) => {
                  const resolved = resolveCartLine(line);
                  if (!resolved) return null;
                  return (
                    <li key={line.variantSku} className="flex justify-between gap-4">
                      <span>
                        {resolved.name} · {resolved.colorName} · {line.variantSku} × {line.qty}
                      </span>
                      <span className="font-mono text-[16px] font-bold">{formatPrice(resolved.unitExcl * line.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 font-mono text-[13px]">
                Verzending {shipping ? formatPrice(shipping) : "gratis"} excl. btw
                {remainingForFreeShipping > 0 ? `. Nog ${formatPrice(remainingForFreeShipping)} tot gratis verzending` : ""}
              </p>
              <div className="mt-4 flex items-baseline justify-between">
                <span>Totaal incl. btw</span>
                <span className="font-mono text-[28px] font-bold">{formatPrice(totalIncl)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" className={buttonVariants({ variant: "secondary" })} onClick={() => setStep(1)}>
                  Terug
                </button>
                <button type="submit" disabled={pending} className={buttonVariants({ variant: "primary" })}>
                  {pending ? "Checkout starten…" : "Naar betalen"}
                </button>
              </div>
              <p className="mt-3 text-[13px] text-kg-text-2">
                U betaalt bij Shopify, behalve op rekening. Er is pas een bestelling als die stap lukt. Het bedrag daar is leidend, inclusief btw. Montage zit niet in dat bedrag.
              </p>
              <p className="mt-3 text-[13px] text-kg-text-2">
                <Link href="/algemene-voorwaarden">Voorwaarden</Link>
                {" · "}
                <Link href="/privacy">Privacy</Link>
                {" · "}
                <Link href="/herroepingsrecht">Herroepingsrecht</Link>
                {" · "}
                <a href={site.whatsapp}>WhatsApp {site.mobileDisplay}</a>
              </p>
            </aside>
          </>
        ) : null}
      </form>
    </div>
  );
}

function PayOption({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[15px]">
      <input type="radio" name="payment" value={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="min-h-11 border border-kg-lijn bg-white px-3 text-[15px] font-normal outline-none"
      />
    </label>
  );
}
