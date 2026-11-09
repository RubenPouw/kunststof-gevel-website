import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import tls from "node:tls";
import test from "node:test";

import { staticProducts } from "../src/lib/catalog/static.ts";
import { POST } from "../src/app/api/staalaanvraag/route.ts";
import { applyFillout } from "../src/lib/staal/fillout.ts";
import { staalPickerSections } from "../src/lib/staal/picker.ts";
import { resetStaalRateLimit } from "../src/lib/staal/rate-limit.ts";
import { buildStaalTree } from "../src/lib/staal/tree.ts";

const CERT = "/tmp/kg-smtp-cert.pem";
const KEY = "/tmp/kg-smtp-key.pem";

function ensureCert() {
  if (fs.existsSync(CERT) && fs.existsSync(KEY)) return;
  execFileSync(
    "openssl",
    ["req", "-x509", "-newkey", "rsa:2048", "-keyout", KEY, "-out", CERT, "-days", "1", "-nodes", "-subj", "/CN=127.0.0.1"],
    { stdio: "ignore" },
  );
}

function startSmtp() {
  ensureCert();
  const messages: string[] = [];
  const server = tls.createServer({ cert: fs.readFileSync(CERT), key: fs.readFileSync(KEY) }, (socket) => {
    socket.write("220 localhost ESMTP\r\n");
    let buf = "";
    let dataMode = false;
    socket.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      if (dataMode) {
        const end = buf.indexOf("\r\n.\r\n");
        if (end === -1) return;
        messages.push(buf.slice(0, end));
        buf = buf.slice(end + 5);
        dataMode = false;
        socket.write("250 OK\r\n");
      }
      const lines = buf.split("\r\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (/^DATA$/i.test(line)) {
          dataMode = true;
          socket.write("354 Go ahead\r\n");
        } else if (/^QUIT$/i.test(line)) {
          socket.write("221 Bye\r\n");
          socket.end();
        } else {
          socket.write("250 OK\r\n");
        }
      }
    });
  });
  return new Promise<{ port: number; close: () => Promise<void>; messages: string[] }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as net.AddressInfo;
      resolve({
        port: address.port,
        messages,
        close: () =>
          new Promise((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

const ENV_KEYS = [
  "DEALFLOW_WEBHOOK_URL",
  "DEALFLOW_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "LEAD_EMAIL_PROVIDER",
  "LEAD_EMAIL_FROM",
  "LEAD_EMAIL_TO",
  "ACTIVECAMPAIGN_API_URL",
  "ACTIVECAMPAIGN_API_KEY",
  "NODE_TLS_REJECT_UNAUTHORIZED",
] as const;

test("no dealflow env, SMTP OK = 200", async () => {
  const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const smtp = await startSmtp();
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map((part) => String(part)).join(" "));
  };
  try {
    for (const key of ENV_KEYS) delete process.env[key];
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(smtp.port);
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "info@kunststof-gevel.nl";
    process.env.SMTP_PASS = "app-password";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const sections = staalPickerSections(applyFillout(buildStaalTree(staticProducts)));
    const swatch = sections
      .flatMap((section) => section.groups)
      .flatMap((group) => group.swatches)
      .find((item) => item.colorId && item.path.length);
    assert.ok(swatch);
    resetStaalRateLimit();
    const response = await POST(
      new Request("http://kunststof-gevel.test/api/staalaanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyWebsite: "",
          wantsQuote: false,
          name: "Jan Test",
          email: "jan@example.com",
          phone: "0612345678",
          postcode: "3454 WZ",
          houseNumber: "6",
          lines: [{ path: swatch.path, colorIds: [swatch.colorId] }],
        }),
      }),
    );
    const body = (await response.json()) as { ok?: boolean; error?: string; reference?: string };
    assert.equal(response.status, 200, body.error);
    assert.equal(body.ok, true);
    assert.match(body.reference ?? "", /^ST-/);
    assert.equal(smtp.messages.length, 2);
    const joined = smtp.messages.join("\n");
    assert.match(joined, /To: info@kunststof-gevel\.nl/);
    assert.match(joined, /To: jan@example.com/);
    assert.match(joined, /From: kunststof-gevel\.nl <info@kunststof-gevel\.nl>/);
    assert.match(warnings.join("\n"), /\[dealflow\] skipped/);
    assert.equal(joined.includes("app-password"), false);
  } finally {
    console.warn = originalWarn;
    await smtp.close();
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});
