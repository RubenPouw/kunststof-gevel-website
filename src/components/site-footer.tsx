import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { CavesuppliesMark } from "@/components/brand/marks";
import { footerColumns, paymentMethods, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-kg-navy text-kg-grind">
      <div className="h-1.5" style={{ background: "var(--gradient-signal)" }} />
      <div className="container-kg grid gap-10 py-14 lg:grid-cols-[5fr_2fr_2fr_3fr] lg:gap-5">
        <div>
          <Logo size={20} tone="dark" href="/" />
          <p className="mt-4 flex items-center gap-1.5 text-[12px] text-kg-grind">
            <CavesuppliesMark size={22} fill="url(#gb)" />
            <span className="sr-only">Cavesupplies</span>
          </p>
          <p className="mt-3 max-w-sm text-[15px] text-kg-grind">
            Nooit meer schilderen. Vervang hout door kunststof.
          </p>
          <p className="mt-4 font-mono text-[13px] text-kg-grind">
            {site.address}
            <br />
            {site.phone} · {site.hours}
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
          © {new Date().getFullYear()} {site.house} · via {site.name}
        </p>
        <ul className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => (
            <li key={method} className="text-[13px]">
              {method}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
