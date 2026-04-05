import path from "node:path";
import { promises as fs } from "node:fs";

import { resolveMutableDataPath } from "@/lib/runtime-store";
import type {
  IntellyCheckinHistoryEntry,
  IntellyCheckinHistoryResponse,
  IntellyCheckinResponse,
  IntellyCheckinStatus,
} from "@/types/intelly";

type StoredCheckinRecord = {
  issueDate: string;
  checkedAt: string;
};

type StoredCheckinState = {
  recordsByUser: Record<string, StoredCheckinRecord[]>;
};

type StoredReadingState = {
  sectionsByUser: Record<string, Record<string, string[]>>;
};

const checkinFilePath = resolveMutableDataPath("intelly-checkins.json");
const readingFilePath = resolveMutableDataPath("intelly-reading.json");

function defaultCheckinState(): StoredCheckinState {
  return {
    recordsByUser: {},
  };
}

function defaultReadingState(): StoredReadingState {
  return {
    sectionsByUser: {},
  };
}

function resolveUserKey(userEmail?: string | null) {
  return userEmail?.trim().toLowerCase() || "guest";
}

async function readCheckinState(): Promise<StoredCheckinState> {
  try {
    const payload = await fs.readFile(checkinFilePath, "utf8");
    const parsed = JSON.parse(payload) as Partial<StoredCheckinState> & { records?: StoredCheckinRecord[] };

    if (parsed.recordsByUser) {
      return parsed as StoredCheckinState;
    }

    if (Array.isArray(parsed.records)) {
      return {
        recordsByUser: {
          guest: parsed.records,
        },
      };
    }

    return defaultCheckinState();
  } catch {
    return defaultCheckinState();
  }
}

async function writeCheckinState(state: StoredCheckinState): Promise<void> {
  await fs.mkdir(path.dirname(checkinFilePath), { recursive: true });
  await fs.writeFile(checkinFilePath, JSON.stringify(state, null, 2), "utf8");
}

async function readReadingState(): Promise<StoredReadingState> {
  try {
    const payload = await fs.readFile(readingFilePath, "utf8");
    const parsed = JSON.parse(payload) as Partial<StoredReadingState>;
    return parsed.sectionsByUser ? (parsed as StoredReadingState) : defaultReadingState();
  } catch {
    return defaultReadingState();
  }
}

async function writeReadingState(state: StoredReadingState): Promise<void> {
  await fs.mkdir(path.dirname(readingFilePath), { recursive: true });
  await fs.writeFile(readingFilePath, JSON.stringify(state, null, 2), "utf8");
}

export async function readIntellyCheckinVersion(): Promise<string> {
  try {
    const [checkinStat, readingStat] = await Promise.allSettled([
      fs.stat(checkinFilePath),
      fs.stat(readingFilePath),
    ]);
    const checkinVersion = checkinStat.status === "fulfilled" ? checkinStat.value.mtimeMs : 0;
    const readingVersion = readingStat.status === "fulfilled" ? readingStat.value.mtimeMs : 0;
    return `${checkinVersion}:${readingVersion}`;
  } catch {
    return "no-checkins";
  }
}

function shiftIssueDate(issueDate: string, days: number): string {
  const date = new Date(`${issueDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildStreakMap(records: StoredCheckinRecord[]): Map<string, number> {
  const streakMap = new Map<string, number>();

  for (const record of records) {
    const previousDate = shiftIssueDate(record.issueDate, -1);
    const previousStreak = streakMap.get(previousDate) ?? 0;
    streakMap.set(record.issueDate, previousStreak + 1);
  }

  return streakMap;
}

function buildHistoryEntries(records: StoredCheckinRecord[]): IntellyCheckinHistoryEntry[] {
  const streakMap = buildStreakMap(records);
  const bestByDate = new Map<string, number>();
  let rollingBest = 0;

  for (const record of records) {
    const currentStreak = streakMap.get(record.issueDate) ?? 1;
    rollingBest = Math.max(rollingBest, currentStreak);
    bestByDate.set(record.issueDate, rollingBest);
  }

  return [...records]
    .sort((left, right) => right.issueDate.localeCompare(left.issueDate))
    .map((record) => {
      const currentStreak = streakMap.get(record.issueDate) ?? 1;
      return {
        issueDate: record.issueDate,
        currentStreak,
        bestStreak: bestByDate.get(record.issueDate) ?? currentStreak,
        checkedAt: record.checkedAt,
      };
    });
}

function buildResponse(records: StoredCheckinRecord[], issueDate: string): IntellyCheckinResponse {
  const history = buildHistoryEntries(records);
  const currentEntry = history.find((entry) => entry.issueDate === issueDate);
  const latestEntry = history[0];
  const bestStreak = history.reduce((max, entry) => Math.max(max, entry.bestStreak), 0);

  return {
    success: true,
    issueDate,
    currentStreak: currentEntry?.currentStreak ?? latestEntry?.currentStreak ?? 0,
    bestStreak,
    checkedInToday: Boolean(currentEntry),
    lastCheckinDate: latestEntry?.issueDate,
  };
}

export async function markSectionAsRead(
  userEmail: string | null | undefined,
  issueDate: string,
  sectionKey: string,
) {
  const state = await readReadingState();
  const userKey = resolveUserKey(userEmail);
  const userSections = state.sectionsByUser[userKey] ?? {};
  const current = new Set(userSections[issueDate] ?? []);
  current.add(sectionKey);
  userSections[issueDate] = [...current];
  state.sectionsByUser[userKey] = userSections;
  await writeReadingState(state);
}

async function readSectionsCompleted(userEmail: string | null | undefined, issueDate: string) {
  const state = await readReadingState();
  const userKey = resolveUserKey(userEmail);
  return state.sectionsByUser[userKey]?.[issueDate] ?? [];
}

export async function getIntellyCheckinStatus(
  userEmail: string | null | undefined,
  issueDate: string,
  totalSections: number,
  totalItems: number,
): Promise<IntellyCheckinStatus> {
  const state = await readCheckinState();
  const userKey = resolveUserKey(userEmail);
  const records = state.recordsByUser[userKey] ?? [];
  const base = buildResponse(records, issueDate);
  const completedSections = await readSectionsCompleted(userEmail, issueDate);

  return {
    currentStreak: base.currentStreak,
    bestStreak: base.bestStreak,
    completedSections: base.checkedInToday ? totalSections : completedSections.length,
    totalSections,
    pendingItems: base.checkedInToday ? 0 : Math.max(0, totalItems - completedSections.length),
    checkedInToday: base.checkedInToday,
    lastCheckinDate: base.lastCheckinDate,
  };
}

export async function postIntellyTodayCheckin(
  userEmail: string | null | undefined,
  issueDate: string,
): Promise<IntellyCheckinResponse> {
  const state = await readCheckinState();
  const userKey = resolveUserKey(userEmail);
  const records = state.recordsByUser[userKey] ?? [];
  const completedSections = await readSectionsCompleted(userEmail, issueDate);

  if (completedSections.length === 0) {
    throw new Error("READ_REQUIRED");
  }

  const existing = records.find((record) => record.issueDate === issueDate);
  if (existing) {
    return buildResponse(records, issueDate);
  }

  const nextRecord: StoredCheckinRecord = {
    issueDate,
    checkedAt: new Date().toISOString(),
  };
  const nextRecords = [...records, nextRecord].sort((left, right) => left.issueDate.localeCompare(right.issueDate));
  state.recordsByUser[userKey] = nextRecords;
  await writeCheckinState(state);
  return buildResponse(nextRecords, issueDate);
}

export async function getIntellyCheckinHistory(
  userEmail: string | null | undefined,
  limit = 30,
): Promise<IntellyCheckinHistoryResponse> {
  const state = await readCheckinState();
  const userKey = resolveUserKey(userEmail);
  const items = buildHistoryEntries(state.recordsByUser[userKey] ?? []).slice(0, limit);

  return {
    items,
    currentStreak: items[0]?.currentStreak ?? 0,
    bestStreak: items.reduce((max, entry) => Math.max(max, entry.bestStreak), 0),
  };
}
