"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal outline-none focus:border-kg-navy";

export function AccountPanel() {
  const { user, requests, logout, updateProfile } = useAccount();
  const [draft, setDraft] = useState<{ name: string; phone: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="container-kg max-w-xl py-16">
        <p className="font-mono text-[13px] text-kg-text-2">Account</p>
        <h1 className="mt-2">Uw account</h1>
        <p className="mt-3 text-[15px] text-kg-text-2">
          Log in om aanvragen terug te zien die u op dit apparaat deed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/inloggen" className={cn(buttonVariants({ variant: "primary" }), "no-underline hover:no-underline")}>
            Inloggen
          </Link>
          <Link href="/registreren" className={cn(buttonVariants({ variant: "outline" }), "no-underline hover:no-underline")}>
            Registreren
          </Link>
        </div>
      </div>
    );
  }

  const name = draft?.name ?? user.name;
  const phone = draft?.phone ?? user.phone;

  function onSave(event: FormEvent) {
    event.preventDefault();
    const result = updateProfile({ name, phone });
    if (!result.ok) {
      setError(result.error);
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
    setDraft(null);
  }

  return (
    <div className="container-kg max-w-3xl py-12 sm:py-16">
      <p className="font-mono text-[13px] text-kg-text-2">Account</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1>Welkom, {user.name.split(" ")[0]}</h1>
        <button type="button" onClick={logout} className="font-mono text-[13px] text-kg-text-2 underline">
          Uitloggen
        </button>
      </div>
      <p className="mt-3 max-w-xl text-[15px] text-kg-text-2">
        Dit account leeft in uw browser. Offertes en stalen die u hier aanvraagt, komen op deze lijst.
        Shopify-bestellingen en betaling volgen later.
      </p>

      <form onSubmit={onSave} className="mt-8 grid gap-4 border border-kg-lijn bg-white p-6 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Naam
          <input
            value={name}
            onChange={(event) => {
              setDraft({ name: event.target.value, phone });
              setSaved(false);
            }}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          E-mail
          <input value={user.email} readOnly className={cn(fieldClass, "text-kg-text-2")} />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium sm:col-span-2">
          Telefoon
          <input
            value={phone}
            onChange={(event) => {
              setDraft({ name, phone: event.target.value });
              setSaved(false);
            }}
            className={fieldClass}
          />
        </label>
        {error ? (
          <p className="border border-kg-navy px-3 py-2 text-[14px] text-kg-navy sm:col-span-2" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
            Gegevens bewaren
          </button>
          {saved ? <p className="font-mono text-[13px] text-kg-stock">Bewaard op dit apparaat.</p> : null}
        </div>
      </form>

      <section className="mt-10">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Aanvragen</h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-[15px] text-kg-text-2">
            Nog geen offerte of stalen op dit apparaat.{" "}
            <Link href="/offerte">Vraag een offerte aan</Link> of <Link href="/stalen">kies stalen</Link>.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-kg-lijn border-y border-kg-lijn">
            {requests.map((item) => (
              <li key={item.reference} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{item.type === "offerte" ? "Offerte" : "Kleurstalen"}</p>
                  <p className="text-[14px] text-kg-text-2">{item.summary}</p>
                </div>
                <p className="font-mono text-[13px] text-kg-text-2">
                  {item.reference}
                  {" · "}
                  {new Date(item.at).toLocaleDateString("nl-NL")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
