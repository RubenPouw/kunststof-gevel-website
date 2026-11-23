"use client";

import Link from "next/link";
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
    index === 0 && articleCount ? { ...item, k: String(articleCount) } : item,
  );

  return (
    <div
      className="bevel-24 print:hidden"
      style={{ background: "var(--gradient-signal)" }}
    >
      <div className="container-kg flex flex-wrap gap-x-6 gap-y-2 py-3.5 font-mono text-[13px] text-kg-navy sm:text-[14px]">
        {items.map((item) => {
          const body = (
            <>
              <b className="font-bold">{item.k}</b> {item.v}
            </>
          );
          if (item.href) {
            return (
              <Link
                key={`${item.k}-${item.v}`}
                href={item.href}
                className="max-w-full text-inherit no-underline hover:underline"
              >
                {body}
              </Link>
            );
          }
          return (
            <span key={`${item.k}-${item.v}`} className="max-w-full">
              {body}
            </span>
          );
        })}
      </div>
    </div>
  );
}
