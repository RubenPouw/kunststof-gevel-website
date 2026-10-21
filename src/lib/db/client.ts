import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

let client: Sql | null = null;
let clientUrl: string | null = null;

export function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  return url || null;
}

export function getSql() {
  const url = databaseUrl();
  if (!url) return null;
  if (client && clientUrl === url) return client;
  if (client) void client.end({ timeout: 1 });
  client = postgres(url, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
    max_lifetime: 60 * 30,
  });
  clientUrl = url;
  return client;
}
