import { KozijnClusterPage } from "@/components/kozijn-cluster-page";
import { clusterMetadata, clusterPages } from "@/data/seo/kozijn-cluster";

const page = clusterPages["gevel-en-kozijnen-renoveren"];

export const metadata = clusterMetadata(page.slug);
export const revalidate = 3600;

export default function GevelEnKozijnenPage() {
  return <KozijnClusterPage page={page} />;
}
