import { NextResponse } from "next/server";

import { isShopifyConfigured } from "@/lib/shopify/config";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kunststofgevel-website",
    time: new Date().toISOString(),
    catalog: isShopifyConfigured() ? "shopify" : "static",
  });
}
