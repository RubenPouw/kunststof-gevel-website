"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { readBasket, removeBasketItem, writeBasket, type BasketItem } from "@/lib/kozijnen/basket";
import { getLayoutBySlug, layoutPath } from "@/lib/kozijnen/layouts";

export default function OffertemandPage() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setItems(readBasket());
    setReady(true);
  }, []);

  function remove(item: BasketItem) {
    const next = removeBasketItem(items, `${item.layout}?${item.query}`);
    setItems(next);
    writeBasket(next);
  }

  async function onQuote(form: FormData) {
    setError(null);
    setSending(true);
    try {
      const response = await fetch("/api/kozijnen/offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ layout: item.layout, query: item.query })),
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
        setError(body.error || "De aanvraag is niet verstuurd.");
        return;
      }
      setSent(body.reference);
      setItems([]);
      writeBasket([]);
    } catch {
      setError("De aanvraag is niet verstuurd. Probeer het opnieuw.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-kg max-w-3xl py-12">
      <p className="font-mono text-[13px] text-kg-text-2">
        <Link href="/kunststof-kozijnen">Kozijnen</Link>
        {" / Offertemand"}
      </p>
      <h1 className="mt-3">Offertemand</h1>
      <p className="mt-3 text-[16px] text-kg-text-2">
        Meerdere kozijnen in één aanvraag. Een account is niet nodig. Er staat geen prijs op zolang de prijsvlag uit staat.
      </p>
      {!ready ? null : items.length === 0 && !sent ? (
        <p className="mt-8">De mand is leeg.</p>
      ) : (
        <ul className="mt-8 divide-y divide-kg-lijn border-y border-kg-lijn">
          {items.map((item) => {
            const layout = getLayoutBySlug(item.layout);
            const href = layout ? `${layoutPath(layout)}?${item.query}` : "/kunststof-kozijnen";
            return (
              <li key={`${item.layout}?${item.query}`} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <Link href={href}>{item.title}</Link>
                  <p className="font-mono text-[13px] text-kg-text-2">{item.layout}</p>
                </div>
                <button type="button" className="text-[14px] underline" onClick={() => remove(item)}>
                  Haal weg
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {sent ? <p className="mt-6 border border-kg-navy bg-white p-4">Aanvraag {sent} is verstuurd. U hoort op een werkdag van ons.</p> : null}
      {items.length > 0 ? (
        <form
          className="mt-8 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void onQuote(new FormData(event.currentTarget));
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
          <button type="submit" disabled={sending} className={buttonVariants()}>
            {sending ? "Versturen…" : `Vraag offerte voor ${items.length} ${items.length === 1 ? "kozijn" : "kozijnen"}`}
          </button>
        </form>
      ) : null}
    </div>
  );
}
