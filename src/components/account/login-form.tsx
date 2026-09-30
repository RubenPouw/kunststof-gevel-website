"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-11 w-full border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal outline-none focus:border-kg-navy";

export function LoginForm() {
  const { user, login } = useAccount();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) router.replace("/account");
  }, [router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await login(email, password);
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
      <h1 className="mt-2">Inloggen</h1>
      <p className="mt-3 text-[15px] text-kg-text-2">
        Uw account staat in deze browser. Bestellen en betalen koppelen we later via Shopify.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 border border-kg-lijn bg-white p-6">
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
          Wachtwoord
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
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
          {pending ? "Bezig…" : "Inloggen"}
        </button>
      </form>
      <p className="mt-4 text-[14px]">
        Nog geen account? <Link href="/registreren">Registreren</Link>
      </p>
    </div>
  );
}
