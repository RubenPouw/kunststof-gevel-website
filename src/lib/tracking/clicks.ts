const CLICK = /^[A-Za-z0-9._-]{8,128}$/;

export type ClickIds = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

export function cleanClickId(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return CLICK.test(trimmed) ? trimmed : undefined;
}

export function cleanClickIds(input: { gclid?: unknown; gbraid?: unknown; wbraid?: unknown }): ClickIds {
  return {
    gclid: cleanClickId(input.gclid),
    gbraid: cleanClickId(input.gbraid),
    wbraid: cleanClickId(input.wbraid),
  };
}

/** Houd een geldige klikcode bij een redirect. Andere queryparameters blijven zoals ze waren. */
export function preserveClickSearch(base: string, from: string) {
  const out = new URLSearchParams(base.startsWith("?") ? base.slice(1) : base);
  const incoming = new URLSearchParams(from.startsWith("?") ? from.slice(1) : from);
  for (const key of ["gclid", "gbraid", "wbraid"] as const) {
    const value = cleanClickId(incoming.get(key));
    if (value && !out.get(key)) out.set(key, value);
  }
  const text = out.toString();
  return text ? `?${text}` : "";
}
