import type { ReactNode } from "react";

import { site } from "@/lib/site";

export function LegalPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="container-kg max-w-3xl py-12 sm:py-16">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-2">{title}</h1>
      <p className="mt-4 text-[var(--color-text-soft)]">{intro}</p>
      <div className="mt-10 space-y-8 text-[15px] leading-[1.6] text-kg-text-2 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-kg-navy [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-12 border border-kg-lijn bg-white p-4 font-mono text-[13px] text-kg-text-2">
        {site.company}, KvK {site.kvk}, BTW {site.btw}. {site.address}. {site.addressNote}. {site.email}, {site.phone}.
      </p>
    </article>
  );
}
