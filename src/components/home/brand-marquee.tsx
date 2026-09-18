import Link from "next/link";

import type { Brand } from "@/lib/catalog/types";

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const names = brands.map((brand) => brand.name);
  const loop = [...names, ...names];

  return (
    <section className="container-kg border-b border-[var(--color-border)] py-[22px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <p className="kicker shrink-0 text-[var(--color-text-muted)]">Alle merken uit voorraad</p>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div
            className="flex w-max"
            style={{ animation: "kg-marquee 28s linear infinite" }}
          >
            {loop.map((name, index) => (
              <Link
                key={`${name}-${index}`}
                href={`/merken/${brands[index % brands.length]?.slug ?? ""}`}
                className="px-8 font-heading text-[26px] font-semibold tracking-wide text-kg-ink/55 uppercase no-underline hover:text-kg-ink"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
