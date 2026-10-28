import { HplHubPage } from "@/components/catalog/hpl-hub-page";
import { HPL_HUB_ALIAS, hplHubMetadata, parseHplHubSearch } from "@/lib/catalog/hpl-hub";

export const revalidate = 3600;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  return hplHubMetadata(parseHplHubSearch(await searchParams), { alias: true });
}

export default function Page({ searchParams }: Props) {
  return <HplHubPage basePath={HPL_HUB_ALIAS} searchParams={searchParams} />;
}
