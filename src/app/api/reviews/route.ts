import { NextResponse } from "next/server";

import { getSql } from "@/lib/db/client";
import { webwinkelkeurWebhookSecret } from "@/lib/reviews/config";
import { webhookHashMatches } from "@/lib/reviews/map";
import { revalidateReviewPages } from "@/lib/reviews/revalidate";
import { applyReviewWebhook } from "@/lib/reviews/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOPICS = new Set(["reviews.created", "reviews.updated", "reviews.deleted"]);

export async function POST(request: Request) {
  const secret = webwinkelkeurWebhookSecret();
  const body = await request.text();
  if (!webhookHashMatches(body, secret, request.headers.get("x-hash"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const sql = getSql();
  if (!sql) return NextResponse.json({ ok: false }, { status: 503 });
  const topic = request.headers.get("x-topic")?.trim() || "";
  if (topic && !TOPICS.has(topic)) return NextResponse.json({ ok: false }, { status: 400 });
  let payload: unknown;
  try {
    payload = JSON.parse(body) as unknown;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await applyReviewWebhook(sql, topic || "reviews.updated", payload);
  if (!result.ok) return NextResponse.json({ ok: false }, { status: 400 });
  revalidateReviewPages();
  return NextResponse.json({ ok: true, action: result.action });
}