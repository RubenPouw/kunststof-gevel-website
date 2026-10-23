import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { isShopifyCheckoutUrl } from "@/lib/shopify/checkout";

export const metadata: Metadata = {
  title: "Bestelling",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CheckoutThanksPage({ searchParams }: Props) {
  const params = await searchParams;
  const draft = typeof params.draft === "string" ? params.draft : "";
  const invoice = typeof params.invoice === "string" && isShopifyCheckoutUrl(params.invoice) ? params.invoice : "";

  return (
    <div className="container-kg max-w-xl py-16">
      <p className="font-mono text-[13px] text-kg-text-2">Afrekenen</p>
      {draft ? (
        <>
          <h1 className="mt-2">Conceptbestelling {draft}</h1>
          <p className="mt-6 text-kg-text-2">
            Shopify heeft een concept aangemaakt. Dit is pas een bestelling als de betaling is afgerond. Zonder betaalbevestiging in uw mail is er niets betaald.
          </p>
          {invoice ? (
            <a href={invoice} className={buttonVariants({ variant: "primary" }) + " mt-8 inline-flex"}>
              Naar betalen
            </a>
          ) : null}
        </>
      ) : (
        <>
          <h1 className="mt-2">Geen betaling bevestigd</h1>
          <p className="mt-6 text-kg-text-2">
            Deze pagina bevestigt geen bestelling. Een koop staat pas als Shopify de betaling heeft afgerond. Ziet u geen bevestiging in uw mail, dan is er niets besteld. Bel {site.phone} of WhatsApp {site.mobileDisplay}.
          </p>
        </>
      )}
      <Link href="/gevelbekleding" className={buttonVariants({ variant: "secondary" }) + " mt-8 inline-flex"}>
        Verder winkelen
      </Link>
    </div>
  );
}
