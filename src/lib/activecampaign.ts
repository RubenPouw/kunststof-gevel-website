/**
 * ActiveCampaign contact sync. Zonder API-url én API-key slaat de functie
 * over en faalt de aanvraag niet. De sleutel wordt nergens gelogd.
 */

export type ActiveCampaignContact = {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  note?: string;
  /** Best effort. A tag failure does not fail the contact sync. */
  tags?: string[];
};

export type ActiveCampaignResult =
  | { ok: true; skipped: boolean }
  | { ok: false; error: string };

type ActiveCampaignConfig = {
  url: string;
  key: string;
  listId?: string;
};

export function getActiveCampaignConfig(): ActiveCampaignConfig | null {
  const url = process.env.ACTIVECAMPAIGN_API_URL?.trim();
  const key = process.env.ACTIVECAMPAIGN_API_KEY?.trim();
  if (!url || !key) return null;
  const listId = process.env.ACTIVECAMPAIGN_LIST_ID?.trim();
  return {
    url: url.replace(/\/+$/, "").replace(/\/api\/3$/, ""),
    key,
    listId: listId && listId !== "0" ? listId : undefined,
  };
}

export function isActiveCampaignConfigured() {
  return getActiveCampaignConfig() !== null;
}

async function acFetch(config: ActiveCampaignConfig, path: string, method: "GET" | "POST", body?: unknown) {
  const response = await fetch(`${config.url}${path}`, {
    method,
    headers: {
      "Api-Token": config.key,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  });
  const text = await response.text();
  if (!response.ok) {
    return { ok: false as const, status: response.status };
  }
  try {
    return { ok: true as const, data: text ? (JSON.parse(text) as unknown) : null };
  } catch {
    return { ok: false as const, status: response.status };
  }
}

async function acPost(config: ActiveCampaignConfig, path: string, body: unknown) {
  return acFetch(config, path, "POST", body);
}

function tagIdFrom(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const tag = (data as { tag?: { id?: string | number } }).tag;
  return tag?.id ? String(tag.id) : "";
}

async function findTagId(config: ActiveCampaignConfig, name: string) {
  const found = await acFetch(config, `/api/3/tags?search=${encodeURIComponent(name)}`, "GET");
  if (!found.ok || !found.data || typeof found.data !== "object") return "";
  const tags = (found.data as { tags?: { id?: string | number; tag?: string }[] }).tags ?? [];
  const match = tags.find((tag) => tag.tag?.trim().toLowerCase() === name.toLowerCase());
  return match?.id ? String(match.id) : "";
}

async function applyTags(config: ActiveCampaignConfig, contact: string, tags: string[]) {
  const unique = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  for (const name of unique) {
    try {
      const created = await acPost(config, "/api/3/tags", { tag: { tag: name, tagType: "contact" } });
      const id = created.ok ? tagIdFrom(created.data) : await findTagId(config, name);
      if (!id) {
        console.error("[activecampaign] tag niet gevonden", created.ok ? "" : created.status);
        continue;
      }
      const linked = await acPost(config, "/api/3/contactTags", { contactTag: { contact, tag: id } });
      if (!linked.ok && linked.status !== 422) {
        console.error("[activecampaign] tag-koppeling mislukt", linked.status);
      }
    } catch (error) {
      console.error("[activecampaign] tag mislukt", error instanceof Error ? error.name : "fout");
    }
  }
}

function contactId(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const contact = (data as { contact?: { id?: string | number } }).contact;
  if (!contact?.id) return "";
  return String(contact.id);
}

export async function syncActiveCampaignContact(
  input: ActiveCampaignContact,
): Promise<ActiveCampaignResult> {
  const config = getActiveCampaignConfig();
  if (!config) return { ok: true, skipped: true };

  try {
    const synced = await acPost(config, "/api/3/contact/sync", {
      contact: {
        email: input.email.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName?.trim() ?? "",
        phone: input.phone?.trim() ?? "",
      },
    });
    if (!synced.ok) {
      console.error("[activecampaign] contact/sync mislukt", synced.status);
      return { ok: false, error: "ActiveCampaign nam het contact niet aan." };
    }

    const id = contactId(synced.data);
    if (id && config.listId) {
      const listed = await acPost(config, "/api/3/contactLists", {
        contactList: { list: config.listId, contact: id, status: 1 },
      });
      if (!listed.ok) {
        console.error("[activecampaign] lijst-koppeling mislukt", listed.status);
      }
    }
    if (id && input.note?.trim()) {
      const noted = await acPost(config, "/api/3/notes", {
        note: { note: input.note.trim().slice(0, 1000), relid: id, reltype: "Subscriber" },
      });
      if (!noted.ok) {
        console.error("[activecampaign] notitie mislukt", noted.status);
      }
    }
    if (id && input.tags?.length) await applyTags(config, id, input.tags);
    return { ok: true, skipped: false };
  } catch (error) {
    console.error("[activecampaign] niet bereikbaar", error instanceof Error ? error.name : "fout");
    return { ok: false, error: "ActiveCampaign is niet bereikbaar." };
  }
}
