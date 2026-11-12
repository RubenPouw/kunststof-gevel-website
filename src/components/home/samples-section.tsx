import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POINTS = [
  "Gratis, geen verplichting",
  "Binnen 2 werkdagen thuis",
  "Echte kleur, niet het scherm",
] as const;

const TILES = [
  {
    src: "/staal/fillout/keralit-kleur-167-mm-21-wit-9016.jpg",
    label: "Wit",
    turn: "max-sm:-rotate-[4deg] sm:-rotate-[7deg]",
    lift: "sm:translate-y-3",
  },
  {
    src: "/staal/fillout/keralit-kleur-167-mm-17-vergrijsd-ceder.jpg",
    label: "Vergrijsd ceder",
    turn: "max-sm:-rotate-[1deg] sm:-rotate-[2deg]",
    lift: "sm:-translate-y-3",
  },
  {
    src: "/staal/fillout/keralit-kleur-190-mm-11-bruin-eiken.jpg",
    label: "Bruin eiken",
    turn: "max-sm:rotate-[2deg] sm:rotate-[3deg]",
    lift: "sm:translate-y-2",
  },
  {
    src: "/staal/fillout/keralit-kleur-167-mm-2-antraciet-7016.jpg",
    label: "Antraciet",
    turn: "max-sm:rotate-[5deg] sm:rotate-[8deg]",
    lift: "sm:-translate-y-1",
  },
] as const;

export function SamplesSection() {
  return (
    <section id="stalen" className="container-kg section-kg scroll-mt-[130px]">
      <div className="bg-kg-navy text-kg-kalk">
        <div className="h-1.5 bg-kg-signal" />
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="px-6 py-8 sm:px-10 sm:py-10 lg:py-12">
            <p className="font-mono text-[13px] text-kg-signal">Maximaal 4 stalen</p>
            <h2 className="mt-3 text-[32px] leading-[1.02] font-bold tracking-[-0.03em] text-white sm:text-[40px]">
              Gratis
              <span className="block text-kg-signal">kleurstalen</span>
            </h2>
            <ul className="mt-5 grid gap-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-[16px] font-medium text-white">
                  <span className="text-[18px] leading-none text-kg-signal" aria-hidden>
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/staalaanvraag"
              className={cn(
                buttonVariants({ variant: "signal", size: "lg" }),
                "kg-stalen-cta mt-7 h-14 min-h-14 w-full px-8 text-[17px] no-underline transition-colors duration-150 hover:text-kg-navy hover:no-underline sm:w-fit",
              )}
            >
              Gratis stalen aanvragen
            </Link>
            <p className="mt-3 font-mono text-[13px] text-kg-kalk">Kies in daglicht, niet op een scherm.</p>
          </div>
          <div className="flex items-center justify-center bg-kg-navy-2 px-4 pt-8 pb-12 sm:px-8 sm:py-12">
            <ul className="flex items-center justify-center">
              {TILES.map((tile, index) => (
                <li
                  key={tile.src}
                  className={cn(
                    "relative h-[132px] w-[92px] shrink-0 overflow-hidden border-[3px] border-white bg-white shadow-[0_16px_28px_rgb(0_0_0/0.38)] sm:h-[176px] sm:w-[124px] lg:h-[220px] lg:w-[156px]",
                    index > 0 && "-ml-4 sm:-ml-6 lg:-ml-9",
                    tile.turn,
                    tile.lift,
                  )}
                  style={{ zIndex: index + 1 }}
                >
                  <Image
                    src={tile.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 152px, 120px"
                    className="object-cover object-[78%_46%]"
                  />
                  <span className="sr-only">{tile.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
