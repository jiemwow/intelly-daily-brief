import path from "node:path";
import { promises as fs } from "node:fs";

import { deliverBrief } from "@/delivery";
import { readBriefByDate, readLatestBrief } from "@/lib/latest-brief";
import { listStoredUsers } from "@/lib/intelly-user";
import { appendPushOutboxEntry } from "@/lib/push-outbox";
import { resolveMutableDataPath } from "@/lib/runtime-store";
import { buildPushPreviewPayload } from "@/renderers/push";

type PushChannel = "email" | "wechat" | "im";
type StoredTarget = Awaited<ReturnType<typeof listStoredUsers>>[number];

type PushDeliveryRecord = {
  id: string;
  issueDate: string;
  channel: PushChannel;
  status: "sent" | "prepared" | "skipped";
  createdAt: string;
  detail: Record<string, unknown>;
};

const deliveryLogPath = resolveMutableDataPath("push-deliveries.json");

async function readDeliveryLogs(): Promise<PushDeliveryRecord[]> {
  try {
    const payload = await fs.readFile(deliveryLogPath, "utf8");
    const parsed = JSON.parse(payload) as PushDeliveryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDeliveryLogs(records: PushDeliveryRecord[]) {
  await fs.mkdir(path.dirname(deliveryLogPath), { recursive: true });
  await fs.writeFile(deliveryLogPath, JSON.stringify(records, null, 2), "utf8");
}

async function appendDeliveryLog(record: PushDeliveryRecord) {
  const current = await readDeliveryLogs();
  current.unshift(record);
  await writeDeliveryLogs(current.slice(0, 200));
}

function makeRecordId(issueDate: string, channel: PushChannel) {
  return `${issueDate}-${channel}-${Date.now()}`;
}

async function postToBridge(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Bridge responded with status ${response.status}`);
  }

  return await response.json().catch(() => ({ ok: true }));
}

export async function listPushDeliveries() {
  return await readDeliveryLogs();
}

function parseDailyPushTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function readLocalMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.BRIEF_TIMEZONE ?? "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function isWithinDispatchWindow(
  targetTime: string,
  currentMinutes: number,
  windowMinutes: number,
): boolean {
  const targetMinutes = parseDailyPushTime(targetTime);
  if (targetMinutes == null) {
    return false;
  }

  const delta = currentMinutes - targetMinutes;
  return delta >= 0 && delta < windowMinutes;
}

function getWindowMinutes(): number {
  const raw = Number(process.env.PUSH_SCHEDULE_WINDOW_MINUTES ?? "15");
  if (!Number.isFinite(raw) || raw <= 0) {
    return 15;
  }

  return Math.min(60, Math.max(5, Math.round(raw)));
}

async function resolveTargets(
  channel: PushChannel,
  targetUsers?: string[],
): Promise<StoredTarget[]> {
  const users = await listStoredUsers();
  const requested = targetUsers?.map((email) => email.toLowerCase());

  return users.filter(({ user, settings }) => {
    if (requested?.length && !requested.includes(user.email.toLowerCase())) {
      return false;
    }

    if (channel === "email") {
      return settings.pushEmailEnabled;
    }

    return settings.pushWechatEnabled;
  });
}

function extractLoggedTargets(record: PushDeliveryRecord): string[] {
  const targets = record.detail.targets;
  if (!Array.isArray(targets)) {
    return [];
  }

  return targets.filter((target): target is string => typeof target === "string");
}

async function readAlreadySentTargets(issueDate: string, channel: PushChannel): Promise<Set<string>> {
  const logs = await readDeliveryLogs();
  const sentTargets = logs
    .filter((record) => record.issueDate === issueDate && record.channel === channel && record.status === "sent")
    .flatMap(extractLoggedTargets)
    .map((target) => target.toLowerCase());

  return new Set(sentTargets);
}

export async function listEnabledPushTargets(channel: PushChannel): Promise<string[]> {
  const targets = await resolveTargets(channel);
  return targets.map(({ user }) => user.email);
}

export async function listScheduledPushTargets(input: {
  issueDate: string;
  channel: PushChannel;
  now?: Date;
}): Promise<string[]> {
  const [targets, alreadySentTargets] = await Promise.all([
    resolveTargets(input.channel),
    readAlreadySentTargets(input.issueDate, input.channel),
  ]);

  const currentMinutes = readLocalMinutes(input.now);
  const windowMinutes = getWindowMinutes();

  return targets
    .filter(({ settings }) => isWithinDispatchWindow(settings.dailyPushTime, currentMinutes, windowMinutes))
    .map(({ user }) => user.email)
    .filter((email) => !alreadySentTargets.has(email.toLowerCase()));
}

export async function sendPushDelivery(input: {
  issueDate?: string;
  channel: PushChannel;
  targetUsers?: string[];
}) {
  const brief = input.issueDate ? await readBriefByDate(input.issueDate) : await readLatestBrief();
  if (!brief) {
    throw new Error("Brief not found for requested issue date.");
  }

  const createdAt = new Date().toISOString();
  const targets = await resolveTargets(input.channel, input.targetUsers);
  const targetEmails = targets.map(({ user }) => user.email);

  if (input.channel === "email") {
    if (targetEmails.length === 0) {
      const record: PushDeliveryRecord = {
        id: makeRecordId(brief.date, input.channel),
        issueDate: brief.date,
        channel: input.channel,
        status: "skipped",
        createdAt,
        detail: {
          reason: "No eligible email recipients found.",
        },
      };
      await appendDeliveryLog(record);
      return record;
    }

    const results = await Promise.all(targetEmails.map((email) => deliverBrief(brief, email)));
    const record: PushDeliveryRecord = {
      id: makeRecordId(brief.date, input.channel),
      issueDate: brief.date,
      channel: input.channel,
      status: results.some((result) => result.mode === "sent") ? "sent" : "skipped",
      createdAt,
      detail: {
        targets: targetEmails,
        results: results.map((result) =>
          result.mode === "sent" ? { mode: result.mode, providerId: result.id } : result,
        ),
      },
    };
    await appendDeliveryLog(record);
    return record;
  }

  const payload = buildPushPreviewPayload(brief);
  const bridgeUrl =
    input.channel === "wechat"
      ? process.env.WECHAT_BRIDGE_URL
      : process.env.IM_BRIDGE_URL ?? process.env.WECHAT_BRIDGE_URL;

  if (bridgeUrl) {
    const bridgeResult = await postToBridge(bridgeUrl, {
      issueDate: brief.date,
      channel: input.channel,
      targets: targetEmails,
      title: payload.title,
      summary: payload.summary,
      text: payload.compactText,
      returnUrl: payload.returnUrl,
      sections: payload.sections,
    });
    const record: PushDeliveryRecord = {
      id: makeRecordId(brief.date, input.channel),
      issueDate: brief.date,
      channel: input.channel,
      status: "sent",
      createdAt,
      detail: {
        bridgeUrl,
        targets: targetEmails,
        bridgeResult,
      },
    };
    await appendDeliveryLog(record);
    return record;
  }

  const localOutboxId = makeRecordId(brief.date, input.channel);
  await Promise.all(
    (targetEmails.length > 0 ? targetEmails : ["local-preview"]).map((target) =>
      appendPushOutboxEntry({
        id: `${localOutboxId}:${target}`,
        channel: input.channel,
        createdAt,
        target,
        payload: {
          title: payload.title,
          summary: payload.summary,
          text: payload.compactText,
          returnUrl: payload.returnUrl,
        },
      }),
    ),
  );
  const record: PushDeliveryRecord = {
    id: localOutboxId,
    issueDate: brief.date,
    channel: input.channel,
    status: "sent",
    createdAt,
    detail: {
      title: payload.title,
      summary: payload.summary,
      markdown: payload.markdown,
      text: payload.text,
      compactText: payload.compactText,
      returnUrl: payload.returnUrl,
      targets: targetEmails,
      mode: "local-outbox",
    },
  };
  await appendDeliveryLog(record);
  return record;
}
