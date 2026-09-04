import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-kg max-w-xl py-24">
      <p className="kicker">404</p>
      <h1 className="mt-2">Deze pagina bestaat niet.</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">
        De link is kapot of de pagina is verplaatst. Ga terug naar home of vraag
        meteen een offerte aan.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Naar home
        </Link>
        <Link href="/offerte" className={buttonVariants({ variant: "tertiary", size: "lg" })}>
          Offerte
        </Link>
      </div>
    </div>
  );
}
