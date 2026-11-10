import type { Metadata } from "next";

import { StaalPicker } from "@/components/staal/picker";
import { getCatalog } from "@/lib/catalog";
import { applyFillout } from "@/lib/staal/fillout";
import { buildStaalTree } from "@/lib/staal/tree";

export const metadata: Metadata = {
  title: "Gratis staalaanvraag",
  description:
    "Vraag gratis kleurstalen aan voor gevel, dakrand, vensterbank of HPL. Binnen een dag verstuurd.",
  alternates: { canonical: "/staalaanvraag" },
};

type Props = {
  searchParams: Promise<{ groep?: string; product?: string; paneel?: string }>;
};

export default async function StaalaanvraagPage({ searchParams }: Props) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const tree = applyFillout(buildStaalTree(catalog.products));
  return (
    <div className="container-kg py-8 sm:py-12">
      <StaalPicker tree={tree} groep={params.groep} product={params.product} paneel={params.paneel} />
    </div>
  );
}
