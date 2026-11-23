import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Bevel } from "@/components/brand/section-head";
import { JsonLd } from "@/components/seo/json-ld";
import { AppointmentForm } from "@/components/showroom/appointment-form";
import { buttonVariants } from "@/components/ui/button";
import {
  addShowroomDays,
  cleanShowroomReference,
  SHOWROOM_DESCRIPTION,
  SHOWROOM_HORIZON_DAYS,
  SHOWROOM_PHOTO,
  showroomFaqs,
  showroomJsonLd,
  showroomLinks,
  showroomMapHref,
  showroomToday,
} from "@/lib/showroom";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ verzonden?: string; ref?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { verzonden } = await searchParams;
  const sent = verzonden === "1";
  return {
    title: "Showroom op afspraak in Hedel",
    description: SHOWROOM_DESCRIPTION,
    alternates: { canonical: "/showroom" },
    openGraph: {
      title: "Showroom op afspraak in Hedel",
      description: SHOWROOM_DESCRIPTION,
      url: "/showroom",
      images: [{ url: SHOWROOM_PHOTO.src, alt: SHOWROOM_PHOTO.alt }],
    },
    ...(sent ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShowroomPage({ searchParams }: Props) {
  const { verzonden, ref } = await searchParams;
  const sent = verzonden === "1";
  const reference = sent ? cleanShowroomReference(ref) : "";
  const today = showroomToday();
  const latest = addShowroomDays(today, SHOWROOM_HORIZON_DAYS);

  return (
    <div className="pb-20">
      <JsonLd data={showroomJsonLd()} />
      <JsonLd data={faqJsonLd(showroomFaqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Showroom", path: "/showroom" },
        ])}
      />

      <section className="container-kg pt-10 pb-4 lg:pt-14">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/">Home</Link>
          <span> / </span>
          Showroom
        </p>
        <div className="mt-4 grid items-end gap-5 lg:grid-cols-[7fr_5fr]">
          <div>
            <p className="kicker">Showroom Hedel</p>
            <h1 className="mt-2 max-w-xl">Kom de materialen zien en voelen.</h1>
            <p className="mt-4 max-w-xl text-[17px] leading-[1.5] text-kg-text-2">
              In Hedel liggen gevelpanelen, kleuren, dakranden en HPL klaar. U ziet ze en u voelt ze. Alleen op
              afspraak. De koffie staat klaar.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#afspraak" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                {sent ? "Aanvraag ontvangen" : "Vraag een afspraak aan"}
              </a>
              <a href={site.phoneHref} className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                Bel {site.phone}
              </a>
            </div>
            <p className="mt-3 font-mono text-[13px] text-kg-text-2">
              Je aanvraag is nog geen afspraak. Wij bevestigen de dag.
            </p>
          </div>
          <Bevel size={24} className="relative h-[240px] bg-kg-kalk lg:h-[380px]">
            <Image
              src={SHOWROOM_PHOTO.src}
              alt={SHOWROOM_PHOTO.alt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[center_42%]"
            />
            <div className="absolute top-0 left-0 z-10 bg-kg-navy px-[18px] py-3.5 font-mono text-[13px] leading-[1.5] text-kg-kalk">
              Projectfoto
              <br />
              <span className="text-[18px] font-medium tracking-[-0.02em]">VinyPlus Quattro, houtlook</span>
            </div>
          </Bevel>
        </div>
      </section>

      <section className="mt-8 bg-kg-kalk">
        <div className="container-kg grid gap-8 py-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[13px] text-kg-text-2">Alleen op afspraak</p>
            <p className="mt-2 text-[22px] leading-tight font-bold tracking-[-0.03em]">{site.street}</p>
            <p className="font-mono text-[14px]">
              {site.postalCode} {site.city}
            </p>
            <a href={showroomMapHref()} className="mt-3 inline-block text-[15px]">
              Route naar de showroom
            </a>
          </div>
          <div>
            <p className="font-mono text-[13px] text-kg-text-2">Bellen of appen</p>
            <p className="mt-2 text-[22px] leading-tight font-bold tracking-[-0.03em]">
              <a href={site.phoneHref}>{site.phone}</a>
            </p>
            <p className="mt-1 text-[15px]">
              <a href={site.whatsapp}>App {site.mobileDisplay}</a>
            </p>
          </div>
          <div>
            <p className="font-mono text-[13px] text-kg-text-2">Bereikbaar</p>
            <p className="mt-2 text-[22px] leading-tight font-bold tracking-[-0.03em]">{site.hours}</p>
            <p className="mt-1 text-[15px] text-kg-text-2">{site.addressNote}.</p>
          </div>
        </div>
      </section>

      <div className="container-kg mt-12 grid gap-12 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-start">
        <AppointmentForm today={today} latest={latest} sent={sent} reference={reference} />
        <div>
          <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">Wat u hier ziet en voelt</h2>
          <ul className="mt-5 divide-y border-y border-kg-lijn">
            <li className="py-4">
              <h3 className="text-[17px] font-medium">Gevelpanelen en kleuren</h3>
              <p className="mt-1 text-[15px] leading-[1.5] text-kg-text-2">
                Leg profielen en kleuren naast elkaar. De nerf en de kleur ziet u in het echt.
              </p>
            </li>
            <li className="py-4">
              <h3 className="text-[17px] font-medium">Dakranden</h3>
              <p className="mt-1 text-[15px] leading-[1.5] text-kg-text-2">
                Boeidelen en hoeken, in kleur bij de gevel.
              </p>
            </li>
            <li className="py-4">
              <h3 className="text-[17px] font-medium">HPL</h3>
              <p className="mt-1 text-[15px] leading-[1.5] text-kg-text-2">
                Platen om te vergelijken, in het materiaal zelf.
              </p>
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.5] text-kg-text-2">
            Kozijnen liggen erbij, als afwerking naast de gevel. Vensterbanken ook, als u die wilt vergelijken.
          </p>
          <p className="mt-4 text-[15px] leading-[1.5] text-kg-text-2">
            We rekenen samen uit hoeveel materiaal u nodig heeft, zodat u niet te veel of te weinig bestelt. Twijfelt
            u, dan geven we advies dat bij uw situatie past. Doet u het zelf, dan leggen we uit hoe u te werk gaat.
            Liever laten plaatsen? Dat kan met montage door Cavemen, via een offerte.
          </p>
        </div>
      </div>

      <section className="container-kg mt-16 max-w-3xl">
        <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">Veelgestelde vragen</h2>
        <ul className="mt-5 divide-y border-y border-kg-lijn">
          {showroomFaqs.map((item) => (
            <li key={item.q} className="py-5">
              <h3 className="text-[17px] font-medium">{item.q}</h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-kg-text-2">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Verder kijken" className="container-kg mt-16">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Verder kijken</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          {showroomLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
