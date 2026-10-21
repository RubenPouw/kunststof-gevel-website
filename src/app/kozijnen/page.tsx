import type { Metadata } from "next";

import { KozijnenConfigurator } from "@/components/kozijnen/configurator";

export const metadata: Metadata = {
  title: "Kunststof kozijnen",
  description:
    "Kunststof kozijnen op maat. Geleverd, of geplaatst door onze montageploeg. Kömmerling 76, HR++ of triple.",
  alternates: { canonical: "/kozijnen" },
};

export default function KozijnenPage() {
  return <KozijnenConfigurator />;
}
