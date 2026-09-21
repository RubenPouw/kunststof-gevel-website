"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { SampleTraySheet } from "@/components/samples/sample-tray-sheet";
import { useCart } from "@/lib/cart";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { shopNav } from "@/lib/site";
import { cn } from "@/lib/utils";

function SearchIcon() {
  return (
    <svg viewBox="0 0 48 48" width="14" height="14" fill="none" stroke="#4A5568" strokeWidth="4" aria-hidden>
      <circle cx="21" cy="21" r="13" />
      <path d="M31 31l11 11" />
    </svg>
  );
}

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

  const trayDots = Array.from({ length: SAMPLE_LIMIT }, (_, index) => items[index]?.hex ?? "#DDD9D0");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--kg-line-dark)] bg-kg-navy">
      <div className="container-kg flex h-[72px] items-center gap-4 lg:gap-6">
        <Logo size={20} tone="dark" />

        <nav className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-medium text-kg-kalk lg:flex">
          {shopNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2.5 py-2 text-kg-kalk no-underline transition-colors duration-150 hover:bg-kg-navy-2 hover:text-kg-kalk hover:no-underline",
                  active && "bg-kg-signal text-kg-navy hover:bg-kg-signal hover:text-kg-navy",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          onSubmit={onSearch}
          className="hidden h-10 max-w-[260px] min-w-0 flex-1 items-center gap-2 bg-white px-3 md:flex"
        >
          <button type="submit" className="grid shrink-0 place-items-center" aria-label="Zoeken">
            <SearchIcon />
          </button>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op product of artikelnummer"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-kg-navy outline-none placeholder:text-kg-text-2"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onSamplesClick}
            className="hidden h-10 items-center gap-2.5 border border-[var(--kg-grind)] px-3 text-[14px] font-medium text-kg-kalk transition-colors duration-150 hover:bg-kg-navy-2 sm:inline-flex"
            aria-label={`Stalen ${sampleCount} van ${SAMPLE_LIMIT}`}
          >
            <span className="flex pl-1">
              {trayDots.map((hex, index) => (
                <span
                  key={index}
                  className="-ml-1 size-3.5 border-2 border-kg-navy first:ml-0"
                  style={{ background: hex }}
                />
              ))}
            </span>
            Stalen <span className="font-mono">{sampleCount}/4</span>
          </button>
          <Link
            href="/inloggen"
            className="hidden h-10 items-center px-3 font-mono text-[13px] text-kg-grind no-underline hover:text-kg-kalk hover:no-underline sm:inline-flex"
          >
            Account
          </Link>
          <Link
            href="/winkelwagen"
            className="inline-flex h-10 items-center gap-2 bg-kg-signal px-3.5 text-[14px] font-medium text-kg-navy no-underline hover:text-kg-navy hover:no-underline"
          >
            Winkelwagen <span className="font-mono text-[13px]">{count}</span>
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center lg:hidden"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="flex w-4 flex-col gap-[5px]">
              <span className="block h-0.5 bg-kg-kalk" />
              <span className="block h-0.5 bg-kg-kalk" />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-[var(--kg-line-dark)] bg-kg-navy px-6 py-4 lg:hidden">
          <nav className="flex flex-col">
            {shopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center text-[15px] font-medium text-kg-kalk no-underline hover:text-kg-kalk"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={onSamplesClick}
              className="flex min-h-11 items-center text-left text-[15px] font-medium text-kg-kalk"
            >
              Stalen {sampleCount}/{SAMPLE_LIMIT}
            </button>
            <Link
              href="/inloggen"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center text-[15px] font-medium text-kg-kalk no-underline"
            >
              Account
            </Link>
          </nav>
        </div>
      ) : null}

      <form
        onSubmit={onSearch}
        className="flex items-center gap-2 border-t border-[var(--kg-line-dark)] bg-white px-6 py-2 text-[13px] md:hidden"
      >
        <button type="submit" className="grid shrink-0 place-items-center" aria-label="Zoeken">
          <SearchIcon />
        </button>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Zoek op product of artikelnummer"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-kg-navy outline-none placeholder:text-kg-text-2"
        />
      </form>

      <SampleTraySheet open={trayOpen} onOpenChange={setTrayOpen} />
    </header>
  );
}
