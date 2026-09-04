"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { SegmentBar } from "@/components/brand/segment-bar";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, remainingForFreeShipping, clear } = useCart();
  const [customerType, setCustomerType] = useState<"particulier" | "zakelijk">("particulier");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const required = ["name", "email", "phone", "address", "city", "postcode"];
    const missing = required.some((key) => String(data.get(key) ?? "").trim().length < 2);
    if (missing || lines.length === 0) {
      setError("Vul alle velden in. De winkelwagen mag niet leeg zijn.");
      return;
    }
    clear();
    router.push("/afrekenen/bedankt");
  }

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
      <p className="kicker">Afrekenen</p>
      <h1 className="mt-2">Gegevens</h1>
      <SegmentBar size={32} progress={2} className="mt-6" />
      <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
        Winkelwagen / Gegevens / Betalen
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8">
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

        {error ? (
          <p className="border border-kg-ink bg-surface px-4 py-3 text-[13px] text-kg-ink" role="alert">
            {error}
          </p>
        ) : null}

        <aside className="bg-kg-offwhite p-5">
          <h2 className="text-[22px]">Samenvatting</h2>
          <ul className="mt-3 space-y-2 text-[14px]">
            {lines.map((line) => {
              const product = getProduct(line.productSlug);
              if (!product) return null;
              return (
                <li key={`${line.productSlug}-${line.colorName}`} className="flex justify-between gap-4">
                  <span>
                    {product.name} · {line.colorName} × {line.qty}
                  </span>
                  <span className="font-heading text-[18px] font-bold">
                    {formatPrice(product.price * line.qty)}
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
            <span className="font-heading text-[28px] font-bold">{formatPrice(subtotal)}</span>
          </div>
          <button type="submit" className={cn(buttonVariants({ variant: "primary", block: true }), "mt-5")}>
            Verder naar betalen
          </button>
          <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
            Altijd binnen 24 uur bericht · Vragen?{" "}
            <a href={site.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
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
