"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { UspBar } from "@/components/brand/usp-bar";
import { SampleTraySheet } from "@/components/samples/sample-tray-sheet";
import { useCart } from "@/lib/cart";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { shopNav, uspItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { items, count: sampleCount } = useSamples();
  const [menuOpen, setMenuOpen] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/zoeken?q=${encodeURIComponent(next)}` : "/zoeken");
    setMenuOpen(false);
  }

  function onSamplesClick() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setTrayOpen(true);
      setMenuOpen(false);
      return;
    }
    if (pathname === "/") {
      document.getElementById("stalen")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push("/#stalen");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-surface">
      <div className="container-kg flex h-16 items-center gap-6 lg:gap-8">
        <Logo size={17} />

        <nav className="hidden h-16 shrink-0 items-stretch lg:flex">
          {shopNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-0 py-6 text-[14px] font-medium text-kg-ink no-underline transition-colors duration-150 hover:text-brand",
                  "mr-[22px] last:mr-0",
                  active && "box-border border-b-2 border-brand text-kg-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          onSubmit={onSearch}
          className="hidden h-10 w-[320px] max-w-80 min-w-0 flex-1 items-center gap-2 border border-[var(--color-border-strong)] px-3 text-[13px] text-[var(--color-text-muted)] md:flex"
        >
          <button type="submit" className="grid shrink-0 place-items-center text-kg-ink" aria-label="Zoeken">
            <Search className="size-3.5" strokeWidth={1.5} />
          </button>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op product, artikelnummer…"
            className="min-w-0 flex-1 bg-transparent text-kg-ink outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-[13px] font-semibold sm:gap-[18px]">
          <button
            type="button"
            onClick={onSamplesClick}
            className="hidden min-h-11 items-center gap-2 bg-tint px-2.5 text-[13px] font-semibold text-kg-blue-deep sm:inline-flex"
            aria-label={`Kleurstalen ${sampleCount} van ${SAMPLE_LIMIT}`}
          >
            <span className="flex">
              {Array.from({ length: Math.max(sampleCount, 1) }, (_, index) => (
                <span
                  key={items[index]?.id ?? `empty-${index}`}
                  className="-ml-1 size-3.5 first:ml-0"
                  style={{ background: items[index]?.hex ?? "var(--kg-blue-300)" }}
                />
              )).slice(0, 4)}
            </span>
            Kleurstalen {sampleCount}/{SAMPLE_LIMIT}
          </button>
          <Link href="/inloggen" className="hidden text-kg-ink no-underline hover:text-brand sm:inline">
            Inloggen
          </Link>
          <Link
            href="/winkelwagen"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-kg-ink no-underline hover:text-brand"
          >
            <ShoppingBag className="size-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Winkelwagen</span>{" "}
            <span className="text-brand">({count})</span>
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
            <button
              type="button"
              onClick={onSamplesClick}
              className="flex min-h-11 items-center text-left text-[15px] font-medium text-kg-ink"
            >
              Kleurstalen {sampleCount}/{SAMPLE_LIMIT}
            </button>
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
        <button type="submit" className="grid shrink-0 place-items-center text-kg-ink" aria-label="Zoeken">
          <Search className="size-3.5" strokeWidth={1.5} />
        </button>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Zoek op product, artikelnummer…"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-kg-ink outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </form>

      <UspBar items={uspItems} />
      <SampleTraySheet open={trayOpen} onOpenChange={setTrayOpen} />
    </header>
  );
}
