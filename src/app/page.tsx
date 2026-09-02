import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Shield, Sparkles, Wrench } from "lucide-react";

import { ProfileSample } from "@/components/profile-sample";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, profiles, projects, site, steps } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
          alt="Woning met houtlook gevelbekleding"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#13261e]/90 via-[#13261e]/70 to-[#13261e]/20" />
        <div className="relative mx-auto flex min-h-[min(92vh,52rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="text-sm tracking-[0.22em] text-[#e8dcc8] uppercase">
            Advies · Levering · Montage
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl text-white sm:text-6xl sm:leading-[1.05]">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Kunststof gevelbekleding die blijft staan waar hout gaat rotten.
            Kies een profiel, we rekenen een vaste prijs, en we monteren het
            droog en ventilatie-open.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/offerte"
              className={cn(buttonVariants({ size: "lg" }), "h-12 bg-[#e8dcc8] px-6 text-primary hover:bg-white")}
            >
              Vraag een offerte aan
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/assortiment"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-white/30 bg-white/10 px-6 text-white hover:bg-white/20",
              )}
            >
              Bekijk profielen
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/10 bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Shield, title: "10–15 jaar kleurvast", text: "Folie met fabrieksgarantie, geen schilderbeurten." },
            { icon: Sparkles, title: "Onderhoudsarm", text: "Afspoelen is genoeg. Geen beits, geen houtrot." },
            { icon: Wrench, title: "Eigen montageploeg", text: "Regelwerk, ventilatie en dilatatie volgens voorschrift." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Assortiment
            </p>
            <h2 className="mt-2 max-w-lg text-4xl sm:text-5xl">Vier profielen, één systeem.</h2>
          </div>
          <Link href="/assortiment" className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline">
            Volledig assortiment <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.map((profile) => (
            <Link
              key={profile.slug}
              href="/assortiment"
              className="group rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ProfileSample variant={profile.slug} />
              <h3 className="mt-4 text-2xl">{profile.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{profile.summary}</p>
              <p className="mt-3 text-sm font-medium">vanaf €{profile.priceFrom} / m²</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase opacity-70">
              Waarom kunststof
            </p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Hout zonder het gedoe van hout.</h2>
            <p className="mt-4 text-primary-foreground/75">
              Een gevel moet water keren, ventileren en er over tien jaar nog
              uitzien. Kunststof panelen doen dat zonder jaarlijks schilderwerk.
              Wij rekenen niet in slogans: we meten, we begroten, we monteren.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Geen rot, splinters of schimmel in de panelen",
              "Kleurvast folie in houtlook of unikleur",
              "Lichter dan steenstrips, geschikt voor houtskelet en steen",
              "Demontabel bij schade; geen complete gevel opnieuw",
              "Vaste prijs na opname, inclusief hoeken en profielen",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-[#e8dcc8]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Werkwijze
        </p>
        <h2 className="mt-2 text-4xl sm:text-5xl">Van foto tot oplevering.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <p className="font-heading text-3xl text-accent">{step.n}</p>
              <h3 className="mt-3 text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Projecten
              </p>
              <h2 className="mt-2 text-4xl sm:text-5xl">Recent opgeleverd.</h2>
            </div>
            <Link href="/projecten" className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline">
              Alle projecten <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {projects.slice(0, 2).map((project) => (
              <article key={project.slug} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    {project.location} · {project.area}
                  </p>
                  <h3 className="mt-1 text-2xl">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="text-4xl sm:text-5xl">Veelgestelde vragen</h2>
        <Accordion className="mt-8">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-4 text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="border-t border-foreground/10 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl">Klaar voor een gevel die blijft.</h2>
            <p className="mt-2 text-muted-foreground">
              Stuur het oppervlak en een paar foto’s. Je krijgt een indicatie dezelfde werkdag.
            </p>
          </div>
          <Link href="/offerte" className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}>
            Offerte aanvragen
          </Link>
        </div>
      </section>
    </div>
  );
}
