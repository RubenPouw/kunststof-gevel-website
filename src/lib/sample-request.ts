export type SampleRequestInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  samples: string;
};

export type SampleActionState = { error: string | null };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSampleBody(raw: unknown): SampleRequestInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? o[k] : "");
  return {
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    address: str("address"),
    postcode: str("postcode"),
    city: str("city"),
    samples: str("samples"),
  };
}

export function validateSampleRequest(input: SampleRequestInput): string | null {
  if (input.name.trim().length < 2) return "Vul uw naam in.";
  if (!emailRe.test(input.email.trim())) return "Vul een geldig e-mailadres in.";
  if (input.phone.replace(/\s/g, "").length < 10) return "Vul een geldig telefoonnummer in.";
  if (input.address.trim().length < 2) return "Vul uw adres in.";
  if (input.postcode.trim().length < 4) return "Vul uw postcode in.";
  if (input.city.trim().length < 2) return "Vul uw plaats in.";
  if (!input.samples.trim()) return "Kies minimaal één kleurstaal.";
  const count = input.samples.split("|").filter(Boolean).length;
  if (count > 4) return "U kunt maximaal vier stalen aanvragen.";
  return null;
}
