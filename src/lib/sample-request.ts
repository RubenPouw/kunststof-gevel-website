export type SampleRequestInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  samples: string;
  companyWebsite: string;
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
    companyWebsite: str("companyWebsite"),
  };
}

export function validateSampleRequest(input: SampleRequestInput): string | null {
  if (input.name.trim().length < 2) return "Vul uw naam in.";
  if (!emailRe.test(input.email.trim())) return "Vul een geldig e-mailadres in.";
  if (input.phone.replace(/\s/g, "").length < 10) return "Vul een geldig telefoonnummer in.";
  if (input.address.trim().length < 2) return "Vul uw adres in.";
  if (!/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(input.postcode.trim())) {
    return "Vul uw postcode in, bijvoorbeeld 5321 KA.";
  }
  if (input.city.trim().length < 2) return "Vul uw plaats in.";
  if (!input.samples.trim()) return "Kies minimaal één kleurstaal.";
  const count = input.samples.split("|").filter(Boolean).length;
  if (count > 4) return "U kunt maximaal vier stalen aanvragen.";
  return null;
}
