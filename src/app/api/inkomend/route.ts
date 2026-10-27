import { NextResponse } from "next/server";

import { clearCatalogCache } from "@/lib/catalog";
import { revalidateAfterCatalogChange } from "@/lib/catalog/revalidate";
import { applyShopifyWebhook } from "@/lib/catalog/sync";
import { databaseUrl } from "@/lib/db/client";
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret || !databaseUrl()) {
    return NextResponse.json({ ok: false, error: "Webhook is nog niet geconfigureerd" }, { status: 401 });
  }

  const raw = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  if (!verifyShopifyWebhookHmac(raw, hmac, secret)) {
    return NextResponse.json({ ok: false, error: "Ongeldige handtekening" }, { status: 401 });
  }

  const shop = request.headers.get("x-shopify-shop-domain")?.toLowerCase();
  const expected = process.env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase().replace(/^https?:\/\//, "");
  if (shop && expected && shop !== expected) {
    return NextResponse.json({ ok: false, error: "Onbekende shop" }, { status: 401 });
  }

  let body: { id?: number | string; handle?: string; admin_graphql_api_id?: string } = {};
  if (raw) {
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "Geen JSON" }, { status: 400 });
    }
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  try {
    const touch = await applyShopifyWebhook(topic, body);
    if (!touch.ignored && !touch.inventory) {
      clearCatalogCache();
      revalidateAfterCatalogChange(touch);
    }
    return NextResponse.json({ ok: true, topic });
  } catch (error) {
    console.error("[catalog] webhook mislukt", topic, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
