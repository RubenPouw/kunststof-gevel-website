import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Inloggen",
};

export default function LoginPage() {
  return (
    <div className="container-kg max-w-md py-16">
      <p className="kicker">Account</p>
      <h1 className="mt-2">Inloggen</h1>
      <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
        Accounts koppelen we nog. Laat uw e-mail achter, dan sturen we een
        bevestiging.
      </p>
      <form className="mt-8 grid gap-4 bg-surface p-6">
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          E-mail
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="min-h-11 border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
          Wachtwoord
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="min-h-11 border border-[var(--color-border-strong)] bg-surface px-3 text-[15px] font-normal"
          />
        </label>
        <button type="submit" className={buttonVariants({ variant: "secondary", block: true })}>
          Inloggen
        </button>
      </form>
      <p className="mt-4 text-[13px]">
        Nog geen account?{" "}
        <Link href="/contact">Neem contact op</Link>
      </p>
    </div>
  );
}
