import { handleOrderWebhook } from "@/lib/tracking/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shopify orders/create. Zelf registreren in het Shopify-beheer. Deze route doet dat niet. */
export async function POST(request: Request) {
  return handleOrderWebhook(request);
}
