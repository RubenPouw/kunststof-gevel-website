import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyShopifyWebhookHmac(rawBody: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const actual = Buffer.from(digest);
  const expected = Buffer.from(header);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
