import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { buttonVariants } from "@/components/ui/button";
import { hero, heroStats } from "@/lib/site";
import { cn } from "@/lib/utils";

export function HomeHero() {
  return (
    <section className="container-kg mt-6">
      <div className="grid min-h-[560px] border border-[var(--color-border)] lg:grid-cols-[1.05fr_1fr]">
        <div
          className="relative flex flex-col justify-center overflow-hidden px-8 py-12 text-white sm:px-14 sm:py-14"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div
            className="pointer-events-none absolute -right-[110px] -bottom-[140px] size-[420px]"
            style={{ background: "var(--glow-orange)" }}
          />
          <p className="kicker relative text-[var(--kg-blue-100)]">{hero.kicker}</p>
          <h1 className="display-home relative mt-3 text-white">
            {hero.title}
            <span className="mt-1 block text-[var(--kg-blue-100)]">{hero.subtitle}</span>
          </h1>
          <p className="relative mt-5 max-w-[480px] text-[17px] leading-[1.55] text-white/88">
            {hero.body}
          </p>
          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <Link href="/gevelbekleding" className={cn(buttonVariants({ variant: "primary" }))}>
              {hero.cta}
            </Link>
            <a href="#stalen" className="text-[15px] font-medium text-white underline underline-offset-4 hover:text-[var(--kg-blue-100)]">
              {hero.samples}
            </a>
          </div>
          <p className="relative mt-3 text-[13px] text-[var(--kg-blue-100)]">{hero.micro}</p>
          <div className="relative mt-10 grid grid-cols-3 gap-4 border-t border-white/22 pt-6">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-[34px] leading-none font-bold">{stat.value}</p>
                <p className="mt-1 text-[13px] text-[var(--kg-blue-100)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[240px] lg:min-h-full">
          <ColorPanel hex="#3A3D41" className="absolute inset-0" />
          <div className="absolute bottom-6 left-6 bg-white p-4">
            <p className="kicker">Project · Houten</p>
            <p className="mt-1 font-heading text-[16px] font-semibold">VinyPlus rondkant · Antraciet</p>
          </div>
        </div>
      </div>
    </section>
  );
}
