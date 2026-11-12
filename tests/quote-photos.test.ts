import assert from "node:assert/strict";
import test from "node:test";

import { smtpPayload } from "../src/lib/mail.ts";
import { photoError } from "../src/lib/quote-photos.ts";

test("foto's blijven binnen aantal, type en grootte", () => {
  assert.equal(photoError([{ name: "gevel.jpg", type: "image/jpeg", size: 1000 }]), null);
  assert.match(photoError([{ name: "plan.pdf", type: "application/pdf", size: 1000 }]) ?? "", /jpg/);
  assert.match(photoError([{ name: "groot.jpg", type: "image/jpeg", size: 11 * 1024 * 1024 }]) ?? "", /10 MB/);
  assert.match(
    photoError(Array.from({ length: 6 }, (_, index) => ({ name: `${index}.jpg`, type: "image/jpeg", size: 10 }))) ?? "",
    /5/,
  );
});

test("de smtp-mail hangt de foto aan de tekst", () => {
  const payload = smtpPayload(
    {
      subject: "Offerte TEST",
      text: "Naam: TEST Webshop\nWaar gaat het om: Gevel\nBericht: Keralit, 35 stuks",
      attachments: [{ filename: "test.png", contentType: "image/png", content: Buffer.from("png") }],
    },
    "info@kunststof-gevel.nl",
    "info@kunststof-gevel.nl",
  );
  assert.match(payload, /multipart\/mixed/);
  assert.match(payload, /TEST Webshop/);
  assert.match(payload, /Waar gaat het om: Gevel/);
  assert.match(payload, /filename="test\.png"/);
  assert.match(payload, /Content-Transfer-Encoding: base64/);
});
