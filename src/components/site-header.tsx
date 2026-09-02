"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <input id="mobile-nav" type="checkbox" className="peer sr-only" />
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-[0.7rem] font-semibold tracking-wide text-primary-foreground">
              KG
            </span>
            <span className="font-heading text-xl leading-none tracking-tight">
              {site.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/offerte"
              className={cn(buttonVariants({ size: "lg" }), "hidden sm:inline-flex")}
            >
              Offerte aanvragen
            </Link>
            <label
              htmlFor="mobile-nav"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "cursor-pointer md:hidden",
              )}
              aria-label="Menu openen"
            >
              <Menu />
            </label>
          </div>
        </div>
      </header>
      <div className="pointer-events-none fixed inset-0 z-[100] hidden peer-checked:pointer-events-auto peer-checked:block md:!hidden">
        <label
          htmlFor="mobile-nav"
          className="absolute inset-0 bg-black/40"
          aria-label="Menu sluiten"
        />
        <nav className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col gap-1 border-l border-foreground/10 bg-background p-4 pt-5 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="font-heading text-lg">{site.name}</p>
            <label
              htmlFor="mobile-nav"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "cursor-pointer")}
              aria-label="Menu sluiten"
            >
              <X />
            </label>
          </div>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-3 text-base hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/offerte"
            className={cn(buttonVariants({ size: "lg" }), "mt-4 h-11 justify-center")}
          >
            Offerte aanvragen
          </Link>
        </nav>
      </div>
    </>
  );
}
