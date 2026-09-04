"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { UspBar } from "@/components/brand/usp-bar";
import { useCart } from "@/lib/cart";
import { shopNav, uspItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/zoeken?q=${encodeURIComponent(next)}` : "/zoeken");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-surface">
      <div className="container-kg flex h-16 items-center gap-8">
        <Logo size={17} />

        <nav className="hidden shrink-0 items-center gap-[22px] text-[14px] font-medium whitespace-nowrap lg:flex">
          {shopNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-kg-ink no-underline hover:text-brand",
                  active && "text-brand",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          onSubmit={onSearch}
          className="hidden min-w-0 max-w-80 flex-1 items-center gap-2 border border-[var(--color-border-strong)] px-3 py-[9px] text-[13px] text-[var(--color-text-muted)] md:flex"
        >
          <Search className="size-3 shrink-0" strokeWidth={1.5} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op product, artikelnummer…"
            className="min-w-0 flex-1 bg-transparent text-kg-ink outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-[18px] text-[13px] font-semibold">
          <Link href="/inloggen" className="hidden text-kg-ink no-underline hover:text-brand sm:inline">
            Inloggen
          </Link>
          <Link href="/winkelwagen" className="inline-flex items-center gap-1.5 text-brand no-underline hover:text-brand-hover">
            <ShoppingBag className="size-4" strokeWidth={1.5} />
            Winkelwagen ({count})
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center lg:hidden"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="flex w-4 flex-col gap-[5px]">
              <span className="block h-0.5 bg-kg-ink" />
              <span className="block h-0.5 bg-kg-ink" />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--color-border)] bg-surface px-6 py-4 lg:hidden">
          <nav className="flex flex-col">
            {shopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center text-[15px] font-medium text-kg-ink no-underline"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/inloggen"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center text-[15px] font-medium text-kg-ink no-underline"
            >
              Inloggen
            </Link>
          </nav>
        </div>
      ) : null}

      <form
        onSubmit={onSearch}
        className="flex items-center gap-2 border-t border-[var(--color-border)] px-6 py-2 text-[13px] text-[var(--color-text-muted)] md:hidden"
      >
        <Search className="size-3 shrink-0" strokeWidth={1.5} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Zoek op product, artikelnummer…"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-kg-ink outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </form>

      <UspBar items={uspItems} />
    </header>
  );
}
