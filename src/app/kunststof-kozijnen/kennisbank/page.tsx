import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { articles } from "@/lib/kozijnen/kennis";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kennisbank kozijnen",
  description: "Meten, draairichting, glas, ventilatie, beslag, profiel, montage, subsidie en levering van kunststof kozijnen.",
  alternates: { canonical: "/kunststof-kozijnen/kennisbank" },
};

export default function KennisbankPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kunststof kozijnen", path: "/kunststof-kozijnen" },
          { name: "Kennisbank", path: "/kunststof-kozijnen/kennisbank" },
        ])}
      />
      <header className="container-kg max-w-3xl pt-12 pb-8">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/kunststof-kozijnen" className="underline underline-offset-[3px]">
            Kozijnen
          </Link>
          {" / Kennisbank"}
        </p>
        <h1 className="mt-4">Kennisbank kozijnen</h1>
        <p className="mt-4 text-[17px] leading-normal text-kg-text-2">
          Meten, draairichting, glas en plaatsing. Geschreven voor deze configurator, zonder cijfers die de leverancier nog niet bevestigd heeft.
        </p>
      </header>
      <ul className="container-kg grid max-w-3xl gap-3 pb-16">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/kunststof-kozijnen/kennisbank/${article.slug}`}
              className="block border border-kg-lijn bg-white p-4 no-underline hover:no-underline"
            >
              <p className="font-mono text-[12px] text-kg-text-2">{article.kicker}</p>
              <p className="mt-1 text-[18px] font-medium text-kg-navy">{article.title}</p>
              <p className="mt-2 text-[15px] text-kg-text-2">{article.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
