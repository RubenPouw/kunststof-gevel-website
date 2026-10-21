import { NextResponse } from "next/server";

import { clearCatalogCache } from "@/lib/catalog";
import { revalidateAfterCatalogChange } from "@/lib/catalog/revalidate";
import { syncCatalogFromShopify } from "@/lib/catalog/sync";
import { databaseUrl } from "@/lib/db/client";
import { catalogCounts } from "@/lib/db/store";
import { revalidateReviewPages } from "@/lib/reviews/revalidate";
import { syncReviews } from "@/lib/reviews/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  const counts = await catalogCounts().catch(() => null);
  return NextResponse.json({ ok: true, counts });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!databaseUrl()) return NextResponse.json({ ok: false, error: "DATABASE_URL ontbreekt" }, { status: 503 });
  const reviews = await syncReviews().catch((error) => {
    console.error("[reviews] nachtcontrole mislukt", error instanceof Error ? error.message : "fout");
    return { ok: false as const };
  });
  try {
    const result = await syncCatalogFromShopify("nacht");
    clearCatalogCache();
    revalidateAfterCatalogChange(result.touch);
    revalidateReviewPages();
    return NextResponse.json({ ok: true, ...result, reviews, touch: undefined });
  } catch (error) {
    console.error("[catalog] nachtcontrole mislukt", error);
    return NextResponse.json({ ok: false, reviews }, { status: 500 });
  }
}
