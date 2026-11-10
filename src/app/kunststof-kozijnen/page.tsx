import Link from "next/link";

import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnFaqs, KozijnLinks } from "@/components/kozijnen/links";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { categoryPath, pageSeo } from "@/data/seo/category-pages";
import { hubCopy } from "@/lib/kozijnen/content";
import { PROFILE } from "@/lib/kozijnen/config";
import { GROUPS, allLayouts, getLayoutBySlug, layoutPath } from "@/lib/kozijnen/layouts";
import { defaultConfig } from "@/lib/kozijnen/model";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata = {
  title: { absolute: pageSeo.kozijnen.title },
  description: hubCopy.description,
  alternates: { canonical: pageSeo.kozijnen.path },
};

const GROUP_FACE: Record<(typeof GROUPS)[number]["id"], string> = {
  ramen: "draaikiepraam",
  schuifpuien: "schuifpui-2-delig",
  deuren: "tuindeur",
};

const STEPS = ["Type", "Indeling", "Maat", "Kleur", "Offerte"] as const;

const USPS = [
  { title: "Eén profiel", text: "Ramen en deuren in hetzelfde kader." },
  { title: "Buitenwerkse maat", text: "U vult breedte en hoogte zelf in." },
  { title: "Vrijblijvend", text: "De configurator eindigt in een offerte." },
  { title: "Kleurstaal", text: "Leg de gevelkleur naast het kozijn." },
] as const;

function UspIcon({ index }: { index: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinejoin: "miter" as const };
  if (index === 0) {
    return (
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect x="6" y="6" width="20" height="20" {...common} />
        <rect x="11" y="11" width="10" height="10" {...common} />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <path d="M6 26 V8 H26" {...common} />
        <path d="M6 8 H10 M6 14 H9 M6 20 H9 M10 26 V22 M16 26 V22 M22 26 V22" {...common} />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <path d="M8 5 H20 L26 11 V27 H8 Z" {...common} />
        <path d="M20 5 V11 H26 M12 17 H22 M12 22 H18" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
      <rect x="5" y="8" width="9" height="16" {...common} />
      <rect x="18" y="8" width="9" height="16" {...common} />
    </svg>
  );
}

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
      <header className="bg-white text-kg-navy">
        <div className="container-kg grid items-center gap-6 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-8">
          <div>
            <p className="font-mono text-[13px] text-kg-navy">
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
            <p className="mt-5 font-mono text-[13px] text-kg-text-2">{PROFILE.name}</p>
            <h1 className="display-plp mt-2 max-w-3xl">{pageSeo.kozijnen.h1}</h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-normal text-kg-text-2">
              Ramen en deuren in één profiel. U stelt het kozijn samen op buitenwerkse maat. Op de site staat nog geen bedrag.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {GROUPS.map((group) => (
                <Link key={group.id} href={group.href} className="inline-flex h-11 items-center bg-kg-signal px-4 text-[15px] font-medium text-kg-navy no-underline hover:no-underline">
                  {group.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="bevel-16 border border-kg-lijn bg-white p-3">
            <img src="/kozijnen/doorsnede.webp" alt="Doorsnede van een kunststof kozijn" width={800} height={800} className="mx-auto h-auto max-h-[240px] w-full object-contain lg:max-h-[300px]" />
          </div>
        </div>
      </header>

      <section style={{ background: "var(--gradient-signal)" }}>
        <ul className="container-kg grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((item, index) => (
            <li key={item.title} className="flex items-start gap-3 text-kg-navy">
              <UspIcon index={index} />
              <span>
                <span className="block text-[15px] font-bold">{item.title}</span>
                <span className="mt-0.5 block text-[14px] leading-snug">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-kg-kalk">
        <div className="container-kg grid gap-5 py-10 md:grid-cols-3">
        {GROUPS.map((group) => {
          const face = getLayoutBySlug(GROUP_FACE[group.id]);
          return (
          <Link key={group.id} href={group.href} className="kg-soft-card flex flex-col overflow-hidden no-underline transition duration-150 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgb(27_40_56/0.16)] hover:no-underline">
            <span className="flex h-40 items-center justify-center bg-[#E7EEF4] px-4">
              {face ? <KozijnDrawing layout={face} config={defaultConfig(face)} caption={false} fit plain prefix={`${group.id}-kaart`} /> : null}
            </span>
            <span className="flex flex-1 flex-col p-6">
              <h2 className="text-[28px] leading-none font-bold tracking-[-0.03em]">{group.title}</h2>
              <p className="mt-3 text-[15px] text-kg-text-2">{group.lead}</p>
              <span className={buttonVariants({ size: "sm", className: "mt-6 w-fit" })}>Samenstellen</span>
            </span>
          </Link>
          );
        })}
        </div>
      </section>

      <section className="bg-kg-navy text-kg-kalk">
        <ol className="container-kg grid gap-3 py-6 sm:grid-cols-5">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center bg-kg-signal font-mono text-[14px] font-bold text-kg-navy">{index + 1}</span>
              <span className="text-[15px] font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-white">
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

      <section className="bg-[#E7EEF4]">
        <div className="container-kg py-14">
        <p className="font-mono text-[13px] text-kg-navy">Kies een indeling</p>
        <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-kg-navy">Indelingen</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allLayouts().map((layout) => (
            <li key={layout.slug}>
              <Link href={layoutPath(layout)} className="kg-soft-card flex h-full flex-col overflow-hidden no-underline transition duration-150 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgb(27_40_56/0.16)] hover:no-underline">
                <span className="flex h-44 items-center justify-center bg-[#E7EEF4] px-4">
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

