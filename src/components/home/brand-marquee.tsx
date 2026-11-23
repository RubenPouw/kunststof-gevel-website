import Image from "next/image";
import Link from "next/link";

import { officialBrandLogo } from "@/lib/catalog/brand-logos";
import type { Brand } from "@/lib/catalog/types";

function marqueeBrands(brands: Brand[]) {
  const list = brands.filter((brand) => brand.slug !== "overig");
  const head = list.slice(0, 8);
  if (head.some((brand) => brand.slug === "profex")) return head;
  const profex = list.find((brand) => brand.slug === "profex");
  return profex ? [...head, profex] : head;
}

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const items = marqueeBrands(brands);

  return (
    <section className="container-kg section-kg" aria-label="Merken">
      <div className="grid grid-cols-2 border-y border-kg-lijn sm:grid-cols-4 lg:grid-cols-8">
        {items.map((brand) => {
          const logo = officialBrandLogo(brand.slug);
          return (
            <Link
              key={brand.slug}
              href={`/merken/${brand.slug}`}
              className="flex min-w-0 items-center justify-center border-kg-lijn px-3 py-[18px] text-center text-[16px] font-bold tracking-[-0.02em] text-kg-navy no-underline transition-colors duration-150 hover:bg-kg-kalk hover:text-kg-navy hover:no-underline sm:border-r sm:last:border-r-0"
            >
              {logo ? (
                <Image
                  src={logo}
                  alt={brand.name}
                  width={148}
                  height={36}
                  unoptimized
                  className="h-7 w-auto max-w-full object-contain lg:h-9"
                />
              ) : (
                brand.name
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
