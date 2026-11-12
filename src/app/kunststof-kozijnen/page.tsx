import Link from "next/link";

import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnFaqs, KozijnLinks } from "@/components/kozijnen/links";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { categoryPath, pageSeo } from "@/data/seo/category-pages";
import { hubCopy } from "@/lib/kozijnen/content";
import { PROFILE } from "@/lib/kozijnen/config";
import { GROUPS, allLayouts, layoutPath } from "@/lib/kozijnen/layouts";
import { defaultConfig } from "@/lib/kozijnen/model";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata = {
  title: { absolute: pageSeo.kozijnen.title },
  description: hubCopy.description,
  alternates: { canonical: pageSeo.kozijnen.path },
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
      <header className="bg-white">
        <div className="container-kg grid items-start gap-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(200px,280px)] lg:gap-x-10 lg:py-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="font-mono text-[13px] text-kg-text-2">
              <Link href="/" className="text-kg-navy underline underline-offset-[3px] hover:text-kg-navy">
                Home
              </Link>
              {" / Kozijnen"}
            </p>
            <nav aria-label="Kozijnen" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[15px] font-medium">
              {GROUPS.map((group) => (
                <Link key={group.id} href={group.href} className="text-kg-navy hover:text-kg-navy">
                  {group.title}
                </Link>
              ))}
              <Link href={categoryPath("kozijnafwerking")} className="text-kg-navy hover:text-kg-navy">
                Kozijnafwerking
              </Link>
              <Link href={categoryPath("vensterbanken")} className="text-kg-navy hover:text-kg-navy">
                Vensterbanken
              </Link>
            </nav>
            <p className="kicker mt-5">{PROFILE.name}</p>
            <h1 className="display-plp mt-2 max-w-3xl">{pageSeo.kozijnen.h1}</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-normal text-kg-text-2">
              Ramen en deuren in één profiel. U stelt het kozijn samen op buitenwerkse maat. Op de site staat nog geen bedrag.
            </p>
          </div>
          <div className="bevel-16 border border-kg-lijn bg-white p-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <img
              src="/kozijnen/doorsnede.webp"
              alt="Doorsnede van een kunststof kozijn"
              width={800}
              height={800}
              className="mx-auto h-auto max-h-[200px] w-full object-contain lg:max-h-[240px]"
            />
          </div>
          <div className="kg-soft-card max-w-2xl p-5 lg:col-start-1 lg:row-start-2">
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">Prijs</h2>
            <p className="mt-3 text-[16px] leading-normal text-kg-text-2">
              De configurator eindigt in een vrijblijvende offerte.
            </p>
            <p className="mt-4 flex flex-wrap gap-3">
              {GROUPS.map((group) => (
                <Link key={group.id} href={group.href} className={buttonVariants({ size: "sm" })}>
                  {group.title}
                </Link>
              ))}
            </p>
          </div>
        </div>
      </header>

      <div className="h-2" style={{ background: "var(--gradient-signal)" }} />

      <section className="bg-kg-kalk">
        <div className="container-kg grid gap-5 py-10 md:grid-cols-3">
          {GROUPS.map((group) => (
            <Link key={group.id} href={group.href} className="kg-soft-card flex flex-col p-6 no-underline hover:no-underline">
              <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">{group.title}</h2>
              <p className="mt-3 text-[15px] text-kg-text-2">{group.lead}</p>
              <span className={buttonVariants({ size: "sm", className: "mt-6 w-fit" })}>Samenstellen</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-kg-navy">
        <div className="container-kg grid gap-5 py-10 sm:grid-cols-2">
          <Link href={categoryPath("kozijnafwerking")} className="flex flex-col bg-kg-navy-2 p-6 text-kg-kalk no-underline shadow-[0_8px_24px_rgb(0_0_0/0.18)] hover:no-underline">
            <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">Kozijnafwerking</h2>
            <p className="mt-3 text-[15px] text-kg-grind">Aansluitprofielen en afwerking rond het kozijn.</p>
            <span className="mt-auto pt-6 font-mono text-[13px] text-kg-signal">Bekijk</span>
          </Link>
          <Link href={categoryPath("vensterbanken")} className="flex flex-col bg-kg-navy-2 p-6 text-kg-kalk no-underline shadow-[0_8px_24px_rgb(0_0_0/0.18)] hover:no-underline">
            <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">Vensterbanken</h2>
            <p className="mt-3 text-[15px] text-kg-grind">De bank zelf, daarna eindkappen en bevestiging, per merk.</p>
            <span className="mt-auto pt-6 font-mono text-[13px] text-kg-signal">Bekijk</span>
          </Link>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-kg py-14">
          <p className="font-mono text-[13px] text-kg-text-2">Kies een indeling</p>
          <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Indelingen</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allLayouts().map((layout) => (
              <li key={layout.slug}>
                <Link href={layoutPath(layout)} className="kg-soft-card flex h-full flex-col overflow-hidden no-underline hover:no-underline">
                  <span className="flex h-44 items-center justify-center border-b border-kg-lijn bg-white px-4">
                    <KozijnDrawing layout={layout} config={defaultConfig(layout)} caption={false} fit plain prefix={`${layout.slug}-indeling`} />
                  </span>
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-medium text-kg-navy">{layout.title}</span>
                    <span className="mt-1 text-[14px] text-kg-text-2">{layout.summary}</span>
                    <span className={buttonVariants({ size: "sm", className: "mt-4 w-fit" })}>Samenstellen</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="h-2" style={{ background: "var(--gradient-signal)" }} />

      <section className="bg-kg-navy text-kg-kalk">
        <div className="container-kg grid gap-10 py-14 lg:grid-cols-[minmax(0,40rem)_minmax(0,22rem)]">
          <div className="space-y-8">
            {hubCopy.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-[22px] font-bold tracking-[-0.03em]">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[16px] leading-normal text-kg-grind">
                    {paragraph}
                  </p>
                ))}
                {section.heading === "Samen met de gevel" ? (
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[15px]">
                    <li>
                      <Link href="/gevel-en-kozijnen-renoveren" className="text-kg-signal">
                        Gevel en kozijnen tegelijk renoveren
                      </Link>
                    </li>
                    <li>
                      <Link href="/kleur-kozijn-en-gevelbekleding" className="text-kg-signal">
                        kleur kozijn en gevelbekleding
                      </Link>
                    </li>
                    <li>
                      <Link href="/gevelbekleding" className="text-kg-signal">
                        Gevelbekleding
                      </Link>
                    </li>
                    <li>
                      <Link href="/staalaanvraag" className="text-kg-signal">
                        Kleurstalen
                      </Link>
                    </li>
                    <li>
                      <Link href="/offerte-montage?delen=Gevel,Kozijnen" className="text-kg-signal">
                        Offerte gevel en kozijnen
                      </Link>
                    </li>
                  </ul>
                ) : null}
              </div>
            ))}
            <p>
              <Link href="/kunststof-kozijnen/kennisbank" className="text-kg-signal">Kennisbank kozijnen</Link>
            </p>
          </div>
          <KozijnFaqs faqs={hubCopy.faqs} />
        </div>
      </section>
      <KozijnLinks />
    </>
  );
}
