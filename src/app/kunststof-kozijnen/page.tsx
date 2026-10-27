import Link from "next/link";

import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnFaqs, KozijnLinks } from "@/components/kozijnen/links";
import { JsonLd } from "@/components/seo/json-ld";
import { hubCopy } from "@/lib/kozijnen/content";
import { PROFILE } from "@/lib/kozijnen/config";
import { GROUPS, allLayouts, layoutPath } from "@/lib/kozijnen/layouts";
import { defaultConfig } from "@/lib/kozijnen/model";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata = {
  title: hubCopy.title,
  description: hubCopy.description,
  alternates: { canonical: "/kunststof-kozijnen" },
};

export default function KozijnenHubPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kunststof kozijnen", path: "/kunststof-kozijnen" },
        ])}
      />
      <JsonLd data={faqJsonLd(hubCopy.faqs)} />
      <header className="container-kg pt-10 pb-6">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/" className="underline underline-offset-[3px]">
            Home
          </Link>
          {" / Kozijnen"}
        </p>
        <p className="kicker mt-6">{PROFILE.name}</p>
        <h1 className="display-plp mt-2 max-w-3xl">Kunststof kozijnen, in één profiel.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-normal text-kg-text-2">{hubCopy.lead}</p>
      </header>

      <section className="container-kg grid gap-3 pb-12 md:grid-cols-3">
        {GROUPS.map((group) => (
          <Link key={group.id} href={group.href} className="border border-kg-lijn bg-white p-5 no-underline hover:no-underline">
            <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">{group.title}</h2>
            <p className="mt-3 text-[15px] text-kg-text-2">{group.lead}</p>
            <p className="mt-6 font-mono text-[13px]">Samenstellen</p>
          </Link>
        ))}
      </section>

      <section className="container-kg pb-14">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Indelingen</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allLayouts().map((layout) => (
            <li key={layout.slug}>
              <Link href={layoutPath(layout)} className="block border border-kg-lijn bg-kg-kalk p-4 no-underline hover:no-underline">
                <KozijnDrawing layout={layout} config={defaultConfig(layout)} caption={false} />
                <p className="mt-3 font-medium text-kg-navy">{layout.title}</p>
                <p className="mt-1 text-[14px] text-kg-text-2">{layout.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-kg grid gap-10 border-t border-kg-lijn py-14 lg:grid-cols-[minmax(0,40rem)_minmax(0,22rem)]">
        <div className="space-y-8">
          {hubCopy.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-[22px] font-bold tracking-[-0.03em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[16px] leading-normal text-kg-text-2">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <p>
            <Link href="/kunststof-kozijnen/kennisbank">Kennisbank kozijnen</Link>
          </p>
        </div>
        <KozijnFaqs faqs={hubCopy.faqs} />
      </section>
      <KozijnLinks />
    </>
  );
}

