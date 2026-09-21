import Link from "next/link";

import { Bevel, SectionHead } from "@/components/brand/section-head";

const APPS = [
  {
    href: "/gevelbekleding",
    name: "Gevelbekleding",
    detail: "rabat · potdeksel · sponning",
    slug: "gevelbekleding",
    bg: "#D9D5CB",
  },
  {
    href: "/dakranden",
    name: "Dakranden",
    detail: "boeidelen · hoeken",
    slug: "dakranden",
    bg: "#C9C4B8",
  },
  {
    href: "/kozijnen",
    name: "Kunststof kozijnen",
    detail: "op maat · geleverd of gezet",
    slug: null,
    count: "configurator",
    bg: "repeating-linear-gradient(90deg,#C9C4B8 0 8px,#D9D5CB 8px 16px)",
  },
  {
    href: "/montage",
    name: "Bevestiging",
    detail: "schroeven · regels",
    slug: "montage",
    bg: "linear-gradient(180deg,#B8B3A6,#D9D5CB)",
  },
] as const;

export function AssortmentGrid({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <section className="container-kg section-kg">
      <SectionHead
        title="Waar gaat u mee aan de slag?"
        aside={
          <Link href="/gevelbekleding" className="font-mono text-[14px] text-kg-text-2 underline-offset-[3px]">
            {total} artikelen
          </Link>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group flex flex-col gap-3 text-inherit no-underline hover:text-inherit hover:no-underline"
          >
            <Bevel size={16} className="aspect-[4/3]" style={{ background: app.bg }} />
            <div className="text-[17px] font-medium leading-[1.3]">{app.name}</div>
            <div className="flex w-full justify-between font-mono text-[13px] text-kg-text-2">
              <span>{app.detail}</span>
              <span>{"count" in app ? app.count : (counts[app.slug ?? ""] ?? 0)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
