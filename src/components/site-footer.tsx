"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { footerColumns, legalNav, site } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/afrekenen" || pathname.startsWith("/afrekenen/")) return null;
  return (
    <footer className="mt-auto bg-kg-navy text-kg-grind print:hidden">
      <div className="h-1.5" style={{ background: "var(--gradient-signal)" }} />
      <div className="container-kg grid gap-10 py-14 lg:grid-cols-[5fr_2fr_2fr_3fr] lg:gap-5">
        <div>
          <Logo size={20} tone="dark" href="/" />
          <p className="mt-4 max-w-sm text-[15px] text-kg-grind">
            Nooit meer schilderen. Vervang hout door kunststof.
          </p>
          <p className="mt-4 font-mono text-[13px] text-kg-grind">
            {site.company}
            <br />
            {site.address}
            <br />
            {site.addressNote}
            <br />
            {site.phone} · {site.mobileDisplay}
            <br />
            {site.hours}
          </p>
          <p className="mt-3 font-mono text-[13px] text-kg-grind">
            KvK {site.kvk}
            <br />
            BTW {site.btw}
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="border-b border-[var(--kg-line-dark)] pb-2 font-mono text-[13px] text-kg-grind">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {column.links.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="text-kg-kalk no-underline transition-colors duration-150 hover:text-white hover:no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-kg flex flex-col gap-4 border-t border-[var(--kg-line-dark)] py-4 pb-8 font-mono text-[13px] text-kg-grind sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.company}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-kg-kalk no-underline hover:text-white hover:no-underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
