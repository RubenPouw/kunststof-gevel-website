import net from "node:net";
import tls from "node:tls";

import { site } from "@/lib/site";

export type LeadEmail = {
  subject: string;
  text: string;
  replyTo?: string;
};

export type LeadEmailResult =
  | { ok: true; skipped: false; provider: string }
  | { ok: true; skipped: true }
  | { ok: false; error: string };

type Provider = "resend" | "mailersend" | "smtp";

function providerName(value: string | undefined): Provider | "auto" | "invalid" {
  const name = value?.trim().toLowerCase() || "auto";
  if (name === "auto" || name === "resend" || name === "mailersend" || name === "smtp") return name;
  return "invalid";
}

function fromAddress() {
  return process.env.LEAD_EMAIL_FROM?.trim() || site.email;
}

function toAddress() {
  return process.env.LEAD_EMAIL_TO?.trim() || site.email;
}

function smtpHost() {
  return process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
}

function smtpUser() {
  return process.env.SMTP_USER?.trim() || site.email;
}

function smtpPort() {
  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  return Number.isFinite(port) && port > 0 ? port : 587;
}

function providerReady(provider: Provider) {
  if (provider === "resend") return Boolean(process.env.RESEND_API_KEY?.trim());
  if (provider === "mailersend") return Boolean(process.env.MAILERSEND_API_KEY?.trim());
  return Boolean(process.env.SMTP_PASS?.trim() && fromAddress() && smtpUser() && smtpHost());
}

function detectProvider(): Provider | null {
  const explicit = providerName(process.env.LEAD_EMAIL_PROVIDER);
  if (explicit === "invalid") return null;
  if (explicit !== "auto") return explicit;
  if (providerReady("smtp")) return "smtp";
  if (providerReady("resend")) return "resend";
  if (providerReady("mailersend")) return "mailersend";
  return null;
}

/** Resolved lead-mail settings. SMTP through Google Workspace is the default once SMTP_PASS is set. */
export function leadMailPlan() {
  const provider = detectProvider();
  return {
    provider,
    from: fromAddress(),
    to: toAddress(),
    host: smtpHost(),
    port: smtpPort(),
    user: smtpUser(),
    ready: provider ? providerReady(provider) : false,
  };
}

async function sendResend(message: LeadEmail, from: string, to: string): Promise<LeadEmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: message.subject,
      text: message.text,
      reply_to: message.replyTo || undefined,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    return { ok: false, error: `Resend HTTP ${response.status}` };
  }
  return { ok: true, skipped: false, provider: "resend" };
}

async function sendMailerSend(message: LeadEmail, from: string, to: string): Promise<LeadEmailResult> {
  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY?.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: from, name: site.name },
      to: [{ email: to }],
      subject: message.subject,
      text: message.text,
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok && response.status !== 202) {
    return { ok: false, error: `MailerSend HTTP ${response.status}` };
  }
  return { ok: true, skipped: false, provider: "mailersend" };
}

function smtpCommand(socket: net.Socket | tls.TLSSocket, command: string) {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP timeout"));
    }, 10000);

    function onData(chunk: Buffer) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] ?? "";
      if (/^\d{3} /.test(last)) {
        cleanup();
        const code = Number(last.slice(0, 3));
        if (code >= 400) reject(new Error(`SMTP ${last}`));
        else resolve(buffer);
      }
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function cleanup() {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
    }

    socket.on("data", onData);
    socket.on("error", onError);
    if (command) socket.write(`${command}\r\n`);
  });
}

async function sendSmtp(message: LeadEmail, from: string, to: string): Promise<LeadEmailResult> {
  const host = smtpHost();
  const port = smtpPort();
  const user = smtpUser();
  const pass = process.env.SMTP_PASS?.trim() ?? "";
  const secure = port === 465;

  const socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    const next = secure
      ? tls.connect({ host, port, servername: host }, () => resolve(next))
      : net.connect({ host, port }, () => resolve(next));
    next.once("error", reject);
  });

  try {
    await smtpCommand(socket, "");
    await smtpCommand(socket, "EHLO kunststof-gevel.nl");
    let channel: net.Socket | tls.TLSSocket = socket;
    if (!secure) {
      await smtpCommand(socket, "STARTTLS");
      channel = await new Promise<tls.TLSSocket>((resolve, reject) => {
        const upgraded = tls.connect({ socket, servername: host }, () => resolve(upgraded));
        upgraded.once("error", reject);
      });
      await smtpCommand(channel, "EHLO kunststof-gevel.nl");
    }
    await smtpCommand(channel, "AUTH LOGIN");
    await smtpCommand(channel, Buffer.from(user).toString("base64"));
    await smtpCommand(channel, Buffer.from(pass).toString("base64"));
    await smtpCommand(channel, `MAIL FROM:<${from}>`);
    await smtpCommand(channel, `RCPT TO:<${to}>`);
    await smtpCommand(channel, "DATA");
    const headers = [
      `From: ${site.name} <${from}>`,
      `To: ${to}`,
      message.replyTo ? `Reply-To: ${message.replyTo}` : "",
      `Subject: ${message.subject.replace(/[\r\n]+/g, " ")}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      message.text.replace(/^\./gm, ".."),
    ]
      .filter(Boolean)
      .join("\r\n");
    await smtpCommand(channel, `${headers}\r\n.`);
    await smtpCommand(channel, "QUIT");
    channel.end();
    return { ok: true, skipped: false, provider: "smtp" };
  } catch (error) {
    socket.destroy();
    const detail = error instanceof Error ? error.message : "SMTP mislukt";
    return { ok: false, error: detail.slice(0, 180) };
  }
}

/**
 * Sends a lead notification. Skips only when no provider is configured.
 * A named provider with missing keys is an error, so the form does not pretend it was sent.
 */
export async function sendLeadEmail(message: LeadEmail): Promise<LeadEmailResult> {
  const explicit = providerName(process.env.LEAD_EMAIL_PROVIDER);
  if (explicit === "invalid") {
    return { ok: false, error: "LEAD_EMAIL_PROVIDER is onbekend." };
  }

  const provider = detectProvider();
  if (!provider) return { ok: true, skipped: true };
  if (!providerReady(provider)) {
    return { ok: false, error: `E-mailprovider ${provider} is niet compleet ingesteld.` };
  }

  const from = fromAddress();
  const to = toAddress();
  try {
    if (provider === "resend") return await sendResend(message, from, to);
    if (provider === "mailersend") return await sendMailerSend(message, from, to);
    return await sendSmtp(message, from, to);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "e-mail mislukt";
    return { ok: false, error: detail.slice(0, 180) };
  }
}
