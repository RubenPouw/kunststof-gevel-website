import type { Metadata } from "next";

import { StaalWizard } from "@/components/staal/wizard";
import { getCatalog } from "@/lib/catalog";
import { buildStaalTree } from "@/lib/staal/tree";

export const metadata: Metadata = {
  title: "Gratis staalaanvraag",
  description:
    "Vraag gratis kleurstalen aan voor gevel, dakrand, vensterbank of HPL. Binnen een dag verstuurd.",
  alternates: { canonical: "/staalaanvraag" },
};

type Props = {
  searchParams: Promise<{ groep?: string; product?: string }>;
};

export default async function StaalaanvraagPage({ searchParams }: Props) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const tree = buildStaalTree(catalog.products);
  return (
    <div className="container-kg py-8 sm:py-12">
      <StaalWizard tree={tree} groep={params.groep} product={params.product} />
    </div>
  );
}
