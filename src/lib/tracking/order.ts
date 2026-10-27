import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook";

import { cleanClickIds } from "./clicks";
import { settleTracking, trackServerEvent } from "./dispatch";
import { cleanClientId } from "./identity";

export type OrderAttribution = {
  consent: boolean;
  clientId?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  orderId: string;
  waarde?: number;
  email?: string;
  phone?: string;
};

type Attr = { name?: unknown; key?: unknown; value?: unknown };

export function parseOrderTracking(body: unknown): OrderAttribution | null {
  if (!body || typeof body !== "object") return null;
  const order = body as Record<string, unknown>;
  const id = order.id;
  if (typeof id !== "number" && typeof id !== "string") return null;
  const orderId = String(id).replace(/[^\w.-]/g, "").slice(0, 64);
  if (!orderId) return null;

  const attrs = [
    ...(Array.isArray(order.note_attributes) ? order.note_attributes : []),
    ...(Array.isArray(order.attributes) ? order.attributes : []),
  ] as Attr[];
  const map = new Map<string, string>();
  for (const attr of attrs) {
    const key = String(attr.name ?? attr.key ?? "");
    if (!key) continue;
    map.set(key, String(attr.value ?? ""));
  }
  const clicks = cleanClickIds({
    gclid: map.get("_kg_gclid"),
    gbraid: map.get("_kg_gbraid"),
    wbraid: map.get("_kg_wbraid"),
  });
  const currency = typeof order.currency === "string" ? order.currency.toUpperCase() : "EUR";
  const total = typeof order.total_price === "string" || typeof order.total_price === "number" ? Number(order.total_price) : NaN;
  const customer = order.customer && typeof order.customer === "object" ? (order.customer as Record<string, unknown>) : {};
  const email = typeof order.email === "string" ? order.email : typeof customer.email === "string" ? customer.email : undefined;
  const phone =
    typeof order.phone === "string" ? order.phone : typeof customer.phone === "string" ? customer.phone : undefined;
  return {
    consent: map.get("_kg_consent") === "granted",
    clientId: cleanClientId(map.get("_kg_client")),
    ...clicks,
    orderId,
    waarde: currency === "EUR" && Number.isFinite(total) && total >= 0 && total < 1_000_000_000 ? Math.round(total * 100) / 100 : undefined,
    email,
    phone,
  };
}

export async function handleOrderWebhook(request: Request, env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch) {
  const secret = env.SHOPIFY_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) {
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const raw = await request.text();
  if (!verifyShopifyWebhookHmac(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const shop = request.headers.get("x-shopify-shop-domain")?.toLowerCase();
  const expected = env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase().replace(/^https?:\/\//, "");
  if (shop && expected && shop !== expected) {
    return Response.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (topic !== "orders/create") {
    return Response.json({ ok: true, ignored: true }, { headers: { "Cache-Control": "no-store" } });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return Response.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const order = parseOrderTracking(body);
  if (!order) return Response.json({ ok: true, ignored: true }, { headers: { "Cache-Control": "no-store" } });
  await settleTracking(
    trackServerEvent(
      "bestelling",
      { order_id: order.orderId, ...(order.waarde == null ? {} : { waarde: order.waarde }) },
      {
        consent: order.consent,
        clientId: order.clientId,
        gclid: order.gclid,
        gbraid: order.gbraid,
        wbraid: order.wbraid,
        email: order.email,
        phone: order.phone,
        orderId: order.orderId,
      },
      env,
      fetchImpl,
    ),
  );
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
