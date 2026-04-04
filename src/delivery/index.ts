import type { DailyBrief } from "@/types/brief";
import { readOptionalEnv } from "@/lib/env";
import { appendPushOutboxEntry } from "@/lib/push-outbox";
import { renderBriefEmail } from "@/renderers/email";
import nodemailer from "nodemailer";

export type DeliveryResult =
  | {
      mode: "skipped";
      reason: string;
    }
  | {
      mode: "sent";
      id: string;
    };

function buildSubject(brief: DailyBrief): string {
  return `${brief.headline} | ${brief.date}`;
}

function readSmtpConfig() {
  const host = readOptionalEnv("SMTP_HOST");
  const port = readOptionalEnv("SMTP_PORT");
  const user = readOptionalEnv("SMTP_USER");
  const pass = readOptionalEnv("SMTP_PASS");

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(port),
    secure: readOptionalEnv("SMTP_SECURE") !== "false",
    user,
    pass,
    fromEmail: readOptionalEnv("SMTP_FROM_EMAIL") ?? user,
  };
}

export async function deliverBrief(
  brief: DailyBrief,
  targetEmail = brief.recipient,
): Promise<DeliveryResult> {
  const resendApiKey = readOptionalEnv("RESEND_API_KEY");
  const fromEmail = readOptionalEnv("RESEND_FROM_EMAIL") ?? "Daily Brief <onboarding@resend.dev>";
  const smtpConfig = readSmtpConfig();

  if (!resendApiKey && !smtpConfig) {
    const localId = `local-email-${Date.now()}`;
    await appendPushOutboxEntry({
      id: localId,
      channel: "email",
      createdAt: new Date().toISOString(),
      target: targetEmail,
      payload: {
        subject: buildSubject(brief),
        html: renderBriefEmail(brief),
      },
    });
    return {
      mode: "sent",
      id: localId,
    };
  }

  if (!resendApiKey && smtpConfig) {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const info = await transporter.sendMail({
      from: smtpConfig.fromEmail,
      to: targetEmail,
      subject: buildSubject(brief),
      html: renderBriefEmail(brief),
    });

    return {
      mode: "sent",
      id: info.messageId || `smtp-email-${Date.now()}`,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [targetEmail],
      subject: buildSubject(brief),
      html: renderBriefEmail(brief),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to send brief email: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as { id?: string };

  return {
    mode: "sent",
    id: payload.id ?? "unknown",
  };
}
