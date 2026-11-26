import Image from "next/image";
import Link from "next/link";

import { brandLogoSrc, officialBrandLogo } from "@/lib/catalog/brand-logos";
import { brandsForCategoryStrip, CATEGORY_BRAND_COPY } from "@/lib/catalog/category-brands";
import type { Brand } from "@/lib/catalog/types";

function logoSrc(slug: string) {
  return officialBrandLogo(slug) ?? brandLogoSrc(slug);
}

/** Logo tiles for the brands that have products in this category. Each tile opens the brand page. */
export function CategoryBrandStrip({ brands }: { brands: Brand[] }) {
  const tiles = brandsForCategoryStrip(brands);
  if (!tiles.length) return null;

  return (
    <section className="mt-8" aria-labelledby="kies-je-merk">
      <h2 id="kies-je-merk" className="text-[22px] font-bold tracking-[-0.03em]">
        {CATEGORY_BRAND_COPY.title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {tiles.map((brand) => {
          const logo = logoSrc(brand.slug);
          return (
            <li key={brand.slug}>
              <Link
                href={`/merken/${brand.slug}`}
                className="kg-soft-card flex h-[76px] w-[148px] items-center justify-center px-3 no-underline hover:no-underline"
              >
                {logo ? (
                  <Image
                    src={logo}
                    alt={brand.name}
                    width={120}
                    height={40}
                    unoptimized
                    className="max-h-10 w-auto max-w-[7.5rem] object-contain"
                  />
                ) : (
                  <span className="text-center text-[15px] leading-tight font-bold text-kg-navy">{brand.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
