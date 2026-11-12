import Link from "next/link";

import { MontageQuoteCard } from "@/components/montage-quote-card";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoArticle } from "@/components/seo/article";
import type { ClusterPage } from "@/data/seo/kozijn-cluster";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

export function KozijnClusterPage({ page }: { page: ClusterPage }) {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Gevel en kozijnen", path: "/gevel-en-kozijnen-renoveren" },
  ];
  if (page.path !== "/gevel-en-kozijnen-renoveren") {
    trail.push({ name: page.h1, path: page.path });
  }
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <header className="bg-white">
        <div className="container-kg max-w-3xl py-10 sm:py-14">
          <p className="font-mono text-[13px] text-kg-text-2">
            <Link href="/" className="underline underline-offset-[3px]">
              Home
            </Link>
            {" / "}
            {page.path === "/gevel-en-kozijnen-renoveren" ? (
              "Gevel en kozijnen"
            ) : (
              <Link href="/gevel-en-kozijnen-renoveren" className="underline underline-offset-[3px]">
                Gevel en kozijnen
              </Link>
            )}
            {page.path === "/gevel-en-kozijnen-renoveren" ? null : ` / ${page.kicker}`}
          </p>
          <h1 className="display-plp mt-4 max-w-3xl">{page.h1}</h1>
          {page.subtitle ? <p className="mt-3 text-[18px] font-medium text-kg-navy">{page.subtitle}</p> : null}
          <p className="mt-4 max-w-2xl text-[17px] leading-normal text-kg-text-2">{page.intro}</p>
        </div>
      </header>
      <div className="h-2" style={{ background: "var(--gradient-signal)" }} />
      <SeoArticle sections={page.sections} faqs={page.faqs} links={page.links} />
      <div className="container-kg max-w-3xl pb-16">
        <MontageQuoteCard
          idPrefix={`cluster-${page.slug}`}
          heading="Offerte gevel en kozijnen"
          draft={{
            areaM2: "",
            montageIncl: 0,
            materialIncl: 0,
            message: "",
            parts: ["Gevel", "Kozijnen"],
          }}
        />
      </div>
    </>
  );
}
