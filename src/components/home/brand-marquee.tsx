import Link from "next/link";

import type { Brand } from "@/lib/catalog/types";

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const items = brands.slice(0, 8);

  return (
    <section className="container-kg section-kg">
      <div className="grid grid-cols-2 border-y border-kg-lijn sm:grid-cols-4 lg:grid-cols-8">
        {items.map((brand) => (
          <Link
            key={brand.slug}
            href={`/merken/${brand.slug}`}
            className="border-kg-lijn px-3 py-[18px] text-center text-[16px] font-bold tracking-[-0.02em] text-kg-navy no-underline transition-colors duration-150 hover:bg-kg-kalk hover:text-kg-navy hover:no-underline sm:border-r sm:last:border-r-0"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
