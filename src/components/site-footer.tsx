import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { footerColumns, paymentMethods, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto text-[var(--kg-blue-100)]" style={{ background: "var(--gradient-ink)" }}>
      <div className="container-kg grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div>
          <Logo size={26} tone="dark" tagline />
          <p className="mt-5 max-w-sm text-[14px] text-[var(--kg-blue-100)]">
            Webshop voor kunststof gevelbekleding, dakranden en kozijnafwerking.
            Onderdeel van {site.company}.
          </p>
          <p className="mt-4 text-[14px] text-[var(--kg-blue-100)]">{site.address}</p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="kicker text-[var(--kg-blue-300)]">{column.title}</p>
            <ul className="mt-4 space-y-2 text-[14px]">
              {column.links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--kg-blue-100)] no-underline transition-colors duration-150 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-kg flex flex-col gap-4 border-t border-white/15 py-4 pb-8 text-[12px] text-[var(--kg-blue-100)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. {site.slogan}.
        </p>
        <ul className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => (
            <li key={method} className="border border-white/25 px-2 py-1 text-[11px] tracking-wide uppercase">
              {method}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
