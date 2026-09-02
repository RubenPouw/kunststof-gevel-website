import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm tracking-[0.18em] uppercase text-muted-foreground">404</p>
      <h1 className="mt-2 text-4xl">Deze pagina bestaat niet.</h1>
      <p className="mt-3 text-muted-foreground">
        De link is kapot of de pagina is verplaatst. Ga terug naar home of vraag
        meteen een offerte aan.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
          Naar home
        </Link>
        <Link
          href="/offerte"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
        >
          Offerte
        </Link>
      </div>
    </div>
  );
}
