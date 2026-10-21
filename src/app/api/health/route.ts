import { NextResponse } from "next/server";

import { databaseUrl } from "@/lib/db/client";
import { catalogCounts } from "@/lib/db/store";
import { isShopifyConfigured } from "@/lib/shopify/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = databaseUrl() ? await catalogCounts().catch(() => null) : null;
  const catalog =
    counts && counts.publicProducts > 0 ? "postgres" : isShopifyConfigured() ? "shopify" : "static";
  return NextResponse.json({
    ok: true,
    service: "kunststofgevel-website",
    time: new Date().toISOString(),
    catalog,
    products: counts?.publicProducts ?? 0,
    shopifyProducts: counts?.shopifyProducts ?? 0,
    lastFullSync: counts?.lastFullSync ?? null,
  });
}
