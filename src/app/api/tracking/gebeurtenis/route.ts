import { acceptClientEvent } from "@/lib/tracking/client-event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return acceptClientEvent(request);
}
