"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal outline-none focus:border-kg-navy";

export function RegisterForm() {
  const { user, register } = useAccount();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) router.replace("/account");
  }, [router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await register({ name, email, phone, password });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/account");
  }

  return (
    <div className="container-kg max-w-md py-16">
      <p className="font-mono text-[13px] text-kg-text-2">Account</p>
      <h1 className="mt-2">Account aanmaken</h1>
      <p className="mt-3 text-[15px] text-kg-text-2">
        Naam en aanvragen blijven op dit apparaat. Er gaat geen wachtwoord naar de server.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 border border-kg-lijn bg-white p-6">
        <label className="grid gap-1.5 text-[13px] font-medium">
          Naam
          <input
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          E-mail
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Telefoon
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium">
          Wachtwoord
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </label>
        {error ? (
          <p className="border border-kg-navy px-3 py-2 text-[14px] text-kg-navy" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={cn(buttonVariants({ variant: "primary", block: true }))}>
          {pending ? "Bezig…" : "Account aanmaken"}
        </button>
        <p className="text-[13px] text-kg-text-2">Minstens 8 tekens. Alleen voor dit apparaat.</p>
      </form>
      <p className="mt-4 text-[14px]">
        Al een account? <Link href="/inloggen">Inloggen</Link>
      </p>
    </div>
  );
}
