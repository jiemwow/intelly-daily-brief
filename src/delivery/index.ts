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
      provider?: "local-outbox" | "smtp" | "resend";
    };

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    readonly detail: Record<string, unknown>,
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

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

  const numericPort = Number(port);
  if (!Number.isFinite(numericPort)) {
    throw new EmailDeliveryError("Invalid SMTP_PORT configuration.", {
      provider: "smtp",
      host,
      port,
    });
  }

  const secure = readOptionalEnv("SMTP_SECURE") !== "false";
  if ((numericPort === 465 && !secure) || (numericPort === 587 && secure)) {
    throw new EmailDeliveryError("SMTP_SECURE does not match the configured SMTP_PORT.", {
      provider: "smtp",
      host,
      port: numericPort,
      secure,
    });
  }

  return {
    host,
    port: numericPort,
    secure,
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
      provider: "local-outbox",
    };
  }

  if (!resendApiKey && smtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
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
        provider: "smtp",
      };
    } catch (error) {
      const smtpError = error as {
        code?: string;
        command?: string;
        response?: string;
        message?: string;
      };
      throw new EmailDeliveryError("SMTP email delivery failed.", {
        provider: "smtp",
        targetEmail,
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        fromEmail: smtpConfig.fromEmail,
        code: smtpError.code,
        command: smtpError.command,
        response: smtpError.response,
        message: smtpError.message ?? String(error),
      });
    }
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
    throw new EmailDeliveryError("Resend email delivery failed.", {
      provider: "resend",
      targetEmail,
      status: response.status,
      message,
    });
  }

  const payload = (await response.json()) as { id?: string };

  return {
    mode: "sent",
    id: payload.id ?? "unknown",
    provider: "resend",
  };
}
