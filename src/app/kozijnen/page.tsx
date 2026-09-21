import type { Metadata } from "next";

import { KozijnenConfigurator } from "@/components/kozijnen/configurator";

export const metadata: Metadata = {
  title: "Kunststof kozijnen",
  description:
    "Kunststof kozijnen op maat. Geleverd, of gezet door een Caveman. Kömmerling 76, HR++ of triple, 15 werkdagen.",
};

export default function KozijnenPage() {
  return <KozijnenConfigurator />;
}
