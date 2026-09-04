import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto text-[var(--kg-offwhite)]" style={{ background: "var(--gradient-ink)" }}>
      <div className="container-kg grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo size={22} tone="dark" tagline />
          <p className="mt-5 max-w-sm text-[13px] text-[var(--kg-blue-100)]">
            Webshop voor kunststof gevelbekleding, dakranden en kozijnafwerking.
            Onderdeel van {site.company}.
          </p>
        </div>
        <div>
          <p className="kicker text-[var(--kg-blue-100)]">Navigatie</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[var(--kg-offwhite)] no-underline hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-[var(--kg-blue-100)]">Contact</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li>
              <a href={site.emailHref} className="text-[var(--kg-offwhite)] no-underline hover:text-white">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className="text-[var(--kg-offwhite)] no-underline hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>{site.address}</li>
            <li>{site.hours}</li>
            <li>Onderdeel van {site.company}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 px-6 py-4 text-center text-[12px] text-[var(--kg-blue-100)]">
        © {new Date().getFullYear()} {site.name}. {site.slogan}.
      </div>
    </footer>
  );
}
