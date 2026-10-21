import { clearCatalogCache } from "@/lib/catalog";
import { syncCatalogFromShopify } from "@/lib/catalog/sync";
import { databaseUrl } from "@/lib/db/client";
import { migrate } from "@/lib/db/migrate";
import { catalogCounts } from "@/lib/db/store";
import { syncReviewsIfEmpty } from "@/lib/reviews/sync";
import { isShopifyConfigured } from "@/lib/shopify/config";

export async function bootCatalog(options: { syncIfEmpty: boolean }) {
  if (!databaseUrl()) {
    console.log("[catalog] geen DATABASE_URL, database wordt overgeslagen");
    return;
  }
  await migrate();
  await syncReviewsIfEmpty().catch((error) => {
    console.error("[reviews] eerste sync mislukt", error instanceof Error ? error.message : "fout");
  });
  if (!options.syncIfEmpty) {
    console.log("[catalog] schema gecontroleerd");
    return;
  }
  const counts = await catalogCounts();
  if (counts && counts.publicProducts > 0) {
    console.log(`[catalog] database heeft ${counts.publicProducts} publieke producten`);
    return;
  }
  if (!isShopifyConfigured()) {
    console.warn("[catalog] database leeg en Shopify niet geconfigureerd");
    return;
  }
  await syncCatalogFromShopify("leeg");
  clearCatalogCache();
}
