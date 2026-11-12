import { KozijnClusterPage } from "@/components/kozijn-cluster-page";
import { clusterMetadata, clusterPages } from "@/data/seo/kozijn-cluster";

const page = clusterPages["volgorde-kozijnen-en-gevel"];

export const metadata = clusterMetadata(page.slug);
export const revalidate = 3600;

export default function VolgordeKozijnenGevelPage() {
  return <KozijnClusterPage page={page} />;
}
