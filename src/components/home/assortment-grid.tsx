import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { Tag } from "@/components/brand/tag";
import type { Category } from "@/lib/catalog/types";

const CATEGORY_HEX: Record<string, string> = {
  gevelbekleding: "#3A3D41",
  dakranden: "#A39480",
  kozijnafwerking: "#E8DCC8",
  montage: "#16307A",
};

export function AssortmentGrid({
  categories,
  counts,
  total,
}: {
  categories: Category[];
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <section className="container-kg section-kg">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Assortiment</p>
          <h2 className="mt-2 font-heading text-[44px] leading-none font-bold uppercase">
            Waar gaat u mee aan de slag?
          </h2>
        </div>
        <Link href="/gevelbekleding" className="hidden text-[14px] font-medium sm:inline">
          Alle {total} producten
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 bg-[var(--color-border)] gap-px sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className="group bg-kg-offwhite text-inherit no-underline transition-colors duration-150 hover:bg-tint hover:text-inherit"
          >
            <div className="relative aspect-[4/3]">
              <ColorPanel hex={CATEGORY_HEX[category.slug] ?? "#3A3D41"} className="absolute inset-0" />
              <Tag className="absolute top-2.5 left-2.5 uppercase">
                {counts[category.slug] ?? 0} producten
              </Tag>
            </div>
            <div className="flex items-start justify-between gap-3 p-4">
              <div>
                <h3 className="font-heading text-[22px] font-semibold">{category.name}</h3>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{category.summary}</p>
              </div>
              <span className="text-brand">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
