import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { enrichBrief } from "@/lib/brief-enrichment";
import { generateDailyBrief } from "@/lib/brief-pipeline";
import { writeArtifact } from "@/lib/io";
import { getCurrentIssueDate } from "@/lib/latest-brief";
import { renderBriefEmail } from "@/renderers/email";

function buildIssueDateAnchor(issueDate: string): Date {
  return new Date(`${issueDate}T12:00:00+08:00`);
}

function buildSubject(headline: string, issueDate: string) {
  return `${headline} | ${issueDate}`;
}

async function readLocalEnvValue(key: string): Promise<string | undefined> {
  const envPath = path.join(process.cwd(), ".env.local");

  try {
    const payload = await fs.readFile(envPath, "utf8");
    for (const rawLine of payload.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const [entryKey, ...rest] = line.split("=");
      if (entryKey !== key) {
        continue;
      }

      const value = rest.join("=").trim();
      return value.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function sendViaMailApp(input: {
  html: string;
  subject: string;
  recipient: string;
}) {
  const htmlPath = path.join(os.tmpdir(), `intelly-mail-${Date.now()}.html`);
  await fs.writeFile(htmlPath, input.html, "utf8");

  const script = `
on run argv
  set htmlPath to item 1 of argv
  set recipientAddress to item 2 of argv
  set mailSubject to item 3 of argv
  tell application "Mail"
    set htmlBody to read POSIX file htmlPath as «class utf8»
    set outgoingMessage to make new outgoing message with properties {visible:false, subject:mailSubject, content:htmlBody}
    tell outgoingMessage
      make new to recipient at end of to recipients with properties {address:recipientAddress}
      send
    end tell
  end tell
end run
`;

  const result = spawnSync(
    "osascript",
    ["-e", script, htmlPath, input.recipient, input.subject],
    {
      encoding: "utf8",
    },
  );

  await fs.unlink(htmlPath).catch(() => undefined);

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || "Mail.app send failed");
  }
}

async function appendLocalMailLog(payload: Record<string, unknown>) {
  const logPath = path.join(process.cwd(), "artifacts", "mail-app-deliveries.json");
  let current: Record<string, unknown>[] = [];
  try {
    current = JSON.parse(await fs.readFile(logPath, "utf8")) as Record<string, unknown>[];
    if (!Array.isArray(current)) {
      current = [];
    }
  } catch {
    current = [];
  }

  current.unshift(payload);
  await writeArtifact(path.dirname(logPath), path.basename(logPath), JSON.stringify(current.slice(0, 100), null, 2));
}

async function main() {
  const recipient =
    process.env.MAIL_APP_RECIPIENT_EMAIL ??
    process.env.BRIEF_RECIPIENT_EMAIL ??
    (await readLocalEnvValue("MAIL_APP_RECIPIENT_EMAIL")) ??
    (await readLocalEnvValue("BRIEF_RECIPIENT_EMAIL"));
  if (!recipient) {
    throw new Error("MAIL_APP_RECIPIENT_EMAIL or BRIEF_RECIPIENT_EMAIL is required");
  }

  const issueDate = getCurrentIssueDate();
  const previousMode = process.env.BRIEF_USE_CODEX_SUMMARY;
  process.env.BRIEF_USE_CODEX_SUMMARY = "0";

  try {
    const draftBrief = await generateDailyBrief(buildIssueDateAnchor(issueDate));
    const brief = {
      ...(await enrichBrief(draftBrief)),
      date: issueDate,
      recipient,
    };

    const artifactsDir = path.join(process.cwd(), "artifacts");
    await writeArtifact(artifactsDir, `daily-brief-${brief.date}.json`, JSON.stringify(brief, null, 2));
    await writeArtifact(artifactsDir, `daily-brief-${brief.date}.html`, renderBriefEmail(brief));

    await sendViaMailApp({
      html: renderBriefEmail(brief),
      recipient,
      subject: buildSubject(brief.headline, brief.date),
    });

    await appendLocalMailLog({
      createdAt: new Date().toISOString(),
      issueDate: brief.date,
      recipient,
      subject: buildSubject(brief.headline, brief.date),
      mode: "mail-app",
    });

    console.log(JSON.stringify({ ok: true, issueDate: brief.date, recipient }));
  } finally {
    if (previousMode === undefined) {
      delete process.env.BRIEF_USE_CODEX_SUMMARY;
    } else {
      process.env.BRIEF_USE_CODEX_SUMMARY = previousMode;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
