import Link from "next/link";

import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/75">
            {site.tagline} Advies, levering en montage van kunststof gevelbekleding.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase opacity-70">
            Navigatie
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/offerte" className="hover:underline">
                Offerte
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase opacity-70">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={site.phoneHref} className="hover:underline">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={site.emailHref} className="hover:underline">
                {site.email}
              </a>
            </li>
            <li>{site.hours}</li>
            <li>{site.region}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-4 py-4 text-center text-xs text-primary-foreground/60 sm:px-6">
        © {new Date().getFullYear()} {site.name}. Onderhoudsvrije gevels, heldere prijzen.
      </div>
    </footer>
  );
}
