import path from "node:path";
import { promises as fs } from "node:fs";

import { resolveMutableDataPath } from "@/lib/runtime-store";

type AdminAttemptEntry = {
  failures: number[];
  blockedUntil?: number;
};

type AdminAttemptState = {
  attemptsByKey: Record<string, AdminAttemptEntry>;
};

const attemptsFilePath = resolveMutableDataPath("admin-attempts.json");
const failureWindowMs = 1000 * 60 * 15;
const blockDurationMs = 1000 * 60 * 10;
const maxFailures = 5;

function defaultState(): AdminAttemptState {
  return {
    attemptsByKey: {},
  };
}

function normalizeFailures(failures: number[], now: number) {
  return failures.filter((timestamp) => now - timestamp < failureWindowMs);
}

async function readState(): Promise<AdminAttemptState> {
  try {
    const payload = await fs.readFile(attemptsFilePath, "utf8");
    const parsed = JSON.parse(payload) as Partial<AdminAttemptState>;
    return parsed.attemptsByKey ? (parsed as AdminAttemptState) : defaultState();
  } catch {
    return defaultState();
  }
}

async function writeState(state: AdminAttemptState) {
  await fs.mkdir(path.dirname(attemptsFilePath), { recursive: true });
  await fs.writeFile(attemptsFilePath, JSON.stringify(state, null, 2), "utf8");
}

function resolveAttemptKey(email: string, ip: string) {
  return `${email.toLowerCase()}::${ip}`;
}

export function readRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function getAdminRateLimitState(email: string, ip: string, now = Date.now()) {
  const state = await readState();
  const key = resolveAttemptKey(email, ip);
  const entry = state.attemptsByKey[key];
  const failures = normalizeFailures(entry?.failures ?? [], now);
  const blockedUntil = entry?.blockedUntil && entry.blockedUntil > now ? entry.blockedUntil : undefined;

  if (!entry || failures.length !== (entry.failures?.length ?? 0) || entry.blockedUntil !== blockedUntil) {
    if (failures.length === 0 && !blockedUntil) {
      delete state.attemptsByKey[key];
    } else {
      state.attemptsByKey[key] = { failures, blockedUntil };
    }
    await writeState(state);
  }

  return {
    blocked: Boolean(blockedUntil),
    retryAfterSeconds: blockedUntil ? Math.max(1, Math.ceil((blockedUntil - now) / 1000)) : 0,
  };
}

export async function registerAdminAccessFailure(email: string, ip: string, now = Date.now()) {
  const state = await readState();
  const key = resolveAttemptKey(email, ip);
  const entry = state.attemptsByKey[key];
  const failures = normalizeFailures(entry?.failures ?? [], now);
  failures.push(now);
  const blockedUntil =
    failures.length >= maxFailures ? now + blockDurationMs : entry?.blockedUntil && entry.blockedUntil > now ? entry.blockedUntil : undefined;

  state.attemptsByKey[key] = {
    failures,
    blockedUntil,
  };
  await writeState(state);

  return {
    blocked: Boolean(blockedUntil),
    retryAfterSeconds: blockedUntil ? Math.max(1, Math.ceil((blockedUntil - now) / 1000)) : 0,
  };
}

export async function clearAdminAccessFailures(email: string, ip: string) {
  const state = await readState();
  const key = resolveAttemptKey(email, ip);
  if (!state.attemptsByKey[key]) {
    return;
  }

  delete state.attemptsByKey[key];
  await writeState(state);
}
