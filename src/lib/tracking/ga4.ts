import type { EventName, EventParams } from "./events";

export function ga4Enabled(env: NodeJS.ProcessEnv) {
  return env.TRACKING_GA4_ACTIEF === "true" && Boolean(env.GA4_MEASUREMENT_ID?.trim()) && Boolean(env.GA4_API_SECRET?.trim());
}

export function ga4Body(clientId: string, name: EventName, params: EventParams) {
  return {
    client_id: clientId,
    events: [
      {
        name,
        params: {
          ...params,
          engagement_time_msec: 1,
        },
      },
    ],
  };
}

export async function sendGa4(
  clientId: string,
  name: EventName,
  params: EventParams,
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch = fetch,
) {
  if (!ga4Enabled(env)) return { sent: false as const, reason: "uit" as const };
  const id = env.GA4_MEASUREMENT_ID!.trim();
  const secret = env.GA4_API_SECRET!.trim();
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(id)}&api_secret=${encodeURIComponent(secret)}`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ga4Body(clientId, name, params)),
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok && response.status !== 204) {
    return { sent: false as const, reason: "google" as const, status: response.status };
  }
  return { sent: true as const };
}
