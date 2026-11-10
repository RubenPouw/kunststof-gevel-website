"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useRef, useState, type AriaAttributes, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type Ref } from "react";

import { Logo } from "@/components/brand/logo";
import { VatSwitch } from "@/components/brand/vat-switch";
import { SampleTraySheet } from "@/components/samples/sample-tray-sheet";
import { useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { isShopNavActive, kozijnNav, productNav, shopNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

function VatBar() {
  return (
    <div className="border-t border-[var(--kg-line-dark)]">
      <div className="container-kg flex h-11 items-center justify-end">
        <VatSwitch />
      </div>
    </div>
  );
}

function Control({
  href,
  controlRef,
  className,
  children,
  onClick,
  onKeyDown,
  ...aria
}: {
  href?: string;
  controlRef: { current: HTMLButtonElement | HTMLAnchorElement | null };
  className: string;
  children: ReactNode;
  onClick: () => void;
  onKeyDown: (event: ReactKeyboardEvent) => void;
} & AriaAttributes) {
  if (href) {
    return (
      <Link
        href={href}
        ref={controlRef as Ref<HTMLAnchorElement>}
        className={className}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...aria}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      ref={controlRef as Ref<HTMLButtonElement>}
      type="button"
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...aria}
    >
      {children}
    </button>
  );
}

function NavMenu({
  label,
  items,
  pathname,
  href,
}: {
  label: string;
  items: readonly { href: string; label: string }[];
  pathname: string;
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const menuId = useId();
  const active = items.some((item) => isShopNavActive(pathname, item.href));

  function close() {
    pinned.current = false;
    setOpen(false);
  }

  function claim() {
    window.dispatchEvent(new CustomEvent("kg-nav", { detail: label }));
    setOpen(true);
  }

  useEffect(() => {
    function onOther(event: Event) {
      if ((event as CustomEvent<string>).detail !== label) close();
    }
    window.addEventListener("kg-nav", onOther);
    return () => window.removeEventListener("kg-nav", onOther);
  }, [label]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => claim()}
      onMouseLeave={() => {
        if (!pinned.current) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
      }}
    >
      <Control
        href={href}
        controlRef={buttonRef}
        className={cn(
          "px-1.5 py-2 text-kg-kalk no-underline transition-colors duration-150 hover:bg-kg-navy-2 hover:text-kg-kalk hover:no-underline focus-visible:outline-[var(--kg-kalk)] xl:px-2",
          (open || active || (href && isShopNavActive(pathname, href))) &&
            "bg-kg-signal text-kg-navy hover:bg-kg-signal hover:text-kg-navy",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => {
          if (href) return;
          const next = !open;
          pinned.current = next;
          if (next) claim();
          else setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          pinned.current = true;
          claim();
          requestAnimationFrame(() => {
            rootRef.current?.querySelector<HTMLAnchorElement>(`#${CSS.escape(menuId)} a`)?.focus();
          });
        }}
      >
        {label}
      </Control>
      {open ? (
        <ul id={menuId} aria-label={label} className="absolute left-0 top-full z-30 min-w-56 border border-kg-navy bg-white py-1">
          {items.map((item) => {
            const itemActive = isShopNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center px-3 text-[15px] font-medium text-kg-navy no-underline hover:bg-kg-kalk hover:text-kg-navy hover:no-underline",
                    itemActive && "bg-kg-kalk",
                  )}
                  aria-current={itemActive ? "page" : undefined}
                  onClick={() => close()}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

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
  const { user } = useAccount();
  const accountHref = user ? "/account" : "/inloggen";
  const { items, count: sampleCount } = useSamples();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [kozijnenOpen, setKozijnenOpen] = useState(false);
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
  const bare = pathname === "/afrekenen" || pathname.startsWith("/afrekenen/");

  if (bare) {
    return (
      <header className="relative z-20 border-b border-[var(--kg-line-dark)] bg-kg-navy print:hidden">
        <div className="container-kg flex min-h-[72px] items-center justify-between gap-4 py-2">
          <Logo size={20} tone="dark" lockup />
          <a href={site.phoneHref} className="font-mono text-[14px] text-kg-kalk no-underline">
            {site.phone}
          </a>
        </div>
        <VatBar />
      </header>
    );
  }

  return (
    <header className="relative z-20 border-b border-[var(--kg-line-dark)] bg-kg-navy print:hidden">
        <div className="container-kg flex min-h-[72px] items-center gap-3 py-2 xl:gap-6">
        <Logo size={20} tone="dark" lockup />

        <nav className="hidden items-center gap-0.5 whitespace-nowrap text-[15px] font-medium text-kg-kalk lg:flex xl:gap-1" aria-label="Hoofdmenu">
          <NavMenu label="Producten" items={productNav} pathname={pathname} />
          <NavMenu label="Kozijnen" href="/kunststof-kozijnen" items={kozijnNav} pathname={pathname} />
          {shopNav.map((item) => {
            const active = isShopNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-1.5 py-2 text-kg-kalk no-underline transition-colors duration-150 hover:bg-kg-navy-2 hover:text-kg-kalk hover:no-underline xl:px-2",
                  active && "bg-kg-signal text-kg-navy hover:bg-kg-signal hover:text-kg-navy",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          action="/zoeken"
          method="get"
          onSubmit={onSearch}
          className="hidden h-10 min-w-[6.5rem] max-w-[15rem] flex-1 items-center gap-2 bg-white px-3 md:flex xl:min-w-[9rem]"
        >
          <button type="submit" className="grid shrink-0 place-items-center" aria-label="Zoeken">
            <SearchIcon />
          </button>
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kleur, artikel of naam"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-kg-navy outline-none placeholder:text-kg-text-2"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            href={site.phoneHref}
            className="hidden font-mono text-[13px] text-kg-kalk no-underline hover:underline lg:inline"
          >
            {site.phone}
          </a>
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
            <span className="hidden xl:inline">Stalen</span> <span className="font-mono">{sampleCount}/4</span>
          </button>
          <Link
            href={accountHref}
            className="hidden h-10 items-center px-3 font-mono text-[13px] text-kg-grind no-underline hover:text-kg-kalk hover:no-underline min-[1360px]:inline-flex"
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

      <VatBar />

      {menuOpen ? (
        <div className="border-t border-[var(--kg-line-dark)] bg-kg-navy px-6 py-4 lg:hidden">
          <nav className="flex flex-col" aria-label="Hoofdmenu">
            <a href={site.phoneHref} className="flex min-h-11 items-center font-mono text-[15px] text-kg-kalk no-underline">
              {site.phone}
            </a>
            <a href={site.mobileHref} className="flex min-h-11 items-center font-mono text-[15px] text-kg-kalk no-underline">
              {site.mobileDisplay}
            </a>
            <button
              type="button"
              className="flex min-h-11 items-center justify-between text-left text-[15px] font-medium text-kg-kalk"
              aria-expanded={productsOpen}
              aria-controls="producten-mobiel"
              onClick={() => setProductsOpen((value) => !value)}
            >
              Producten
              <span aria-hidden className="font-mono text-[13px]">
                {productsOpen ? "−" : "+"}
              </span>
            </button>
            {productsOpen ? (
              <div id="producten-mobiel" className="flex flex-col pb-2 pl-3">
                {productNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center text-[15px] font-medium text-kg-kalk no-underline hover:text-kg-kalk"
                    aria-current={isShopNavActive(pathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="flex min-h-11 items-center justify-between gap-3">
              <Link href="/kunststof-kozijnen" onClick={() => setMenuOpen(false)} className="text-[15px] font-medium text-kg-kalk no-underline">
                Kozijnen
              </Link>
              <button
                type="button"
                className="grid size-11 place-items-center font-mono text-[13px] text-kg-kalk"
                aria-expanded={kozijnenOpen}
                aria-controls="kozijnen-mobiel"
                aria-label={kozijnenOpen ? "Kozijnen sluiten" : "Kozijnen openen"}
                onClick={() => setKozijnenOpen((value) => !value)}
              >
                {kozijnenOpen ? "−" : "+"}
              </button>
            </div>
            {kozijnenOpen ? (
              <div id="kozijnen-mobiel" className="flex flex-col pb-2 pl-3">
                {kozijnNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center text-[15px] font-medium text-kg-kalk no-underline hover:text-kg-kalk"
                    aria-current={isShopNavActive(pathname, item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
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
              href={accountHref}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center text-[15px] font-medium text-kg-kalk no-underline"
            >
              Account
            </Link>
          </nav>
        </div>
      ) : null}

      <form
        action="/zoeken"
        method="get"
        onSubmit={onSearch}
        className="flex items-center gap-2 border-t border-[var(--kg-line-dark)] bg-white px-6 py-2 text-[13px] md:hidden"
      >
        <button type="submit" className="grid shrink-0 place-items-center" aria-label="Zoeken">
          <SearchIcon />
        </button>
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kleur, artikel of naam"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-kg-navy outline-none placeholder:text-kg-text-2"
        />
      </form>

      <SampleTraySheet open={trayOpen} onOpenChange={setTrayOpen} />
    </header>
  );
}
