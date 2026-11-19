"use client";

import { usePathname } from "next/navigation";

import { uspForPath } from "@/lib/usp";

export function FactsStrip({
  articleCount,
}: {
  articleCount?: number;
}) {
  const pathname = usePathname() ?? "/";
  if (pathname === "/afrekenen" || pathname.startsWith("/afrekenen/")) return null;
  const items = uspForPath(pathname).map((item, index) =>
    index === 0 && articleCount
      ? { k: String(articleCount), v: item.v }
      : item,
  );

  return (
    <div
      className="bevel-24 print:hidden"
      style={{ background: "var(--gradient-signal)" }}
    >
      <div className="container-kg flex flex-wrap gap-x-6 gap-y-2 py-3.5 font-mono text-[13px] text-kg-navy sm:text-[14px]">
        {items.map((item) => (
          <span key={`${item.k}-${item.v}`} className="max-w-full">
            <b className="font-bold">{item.k}</b> {item.v}
          </span>
        ))}
      </div>
    </div>
  );
}
