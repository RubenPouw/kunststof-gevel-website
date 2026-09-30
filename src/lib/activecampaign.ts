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

async function acPost(config: ActiveCampaignConfig, path: string, body: unknown) {
  const response = await fetch(`${config.url}${path}`, {
    method: "POST",
    headers: {
      "Api-Token": config.key,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
    return { ok: true, skipped: false };
  } catch (error) {
    console.error("[activecampaign] niet bereikbaar", error instanceof Error ? error.name : "fout");
    return { ok: false, error: "ActiveCampaign is niet bereikbaar." };
  }
}
