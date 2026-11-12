import { KozijnClusterPage } from "@/components/kozijn-cluster-page";
import { clusterMetadata, clusterPages } from "@/data/seo/kozijn-cluster";

const page = clusterPages["kleur-kozijn-en-gevelbekleding"];

export const metadata = clusterMetadata(page.slug);
export const revalidate = 3600;

export default function KleurKozijnGevelPage() {
  return <KozijnClusterPage page={page} />;
}
