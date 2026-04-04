import path from "node:path";
import { promises as fs } from "node:fs";

import type { IntellyPreferredSection, IntellyUserProfile, IntellyUserSettings } from "@/types/intelly";

type StoredUserState = {
  users: Record<string, IntellyUserProfile>;
  settingsByEmail: Record<string, IntellyUserSettings>;
};

const storeFilePath = path.join(process.cwd(), "artifacts", "intelly-user.json");
export const INTELLY_SESSION_COOKIE = "intelly_session_email";

const defaultSettings: IntellyUserSettings = {
  preferredSections: ["ai", "autonomous-driving", "embodied-intelligence", "world", "business"],
  pushEmailEnabled: true,
  pushWechatEnabled: false,
  dailyPushTime: "08:00",
};

function defaultState(): StoredUserState {
  return {
    users: {},
    settingsByEmail: {},
  };
}

function buildDisplayName(email: string): string {
  return email.split("@")[0] || "Intelly Reader";
}

async function readState(): Promise<StoredUserState> {
  try {
    const payload = await fs.readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(payload) as Partial<StoredUserState> & {
      user?: IntellyUserProfile | null;
      settings?: IntellyUserSettings | null;
    };

    if (parsed.users && parsed.settingsByEmail) {
      return {
        users: parsed.users,
        settingsByEmail: parsed.settingsByEmail,
      };
    }

    const migrated = defaultState();
    if (parsed.user?.email) {
      migrated.users[parsed.user.email] = parsed.user;
      migrated.settingsByEmail[parsed.user.email] = parsed.settings ?? { ...defaultSettings };
    }

    return migrated;
  } catch {
    return defaultState();
  }
}

async function writeState(state: StoredUserState): Promise<void> {
  await fs.mkdir(path.dirname(storeFilePath), { recursive: true });
  await fs.writeFile(storeFilePath, JSON.stringify(state, null, 2), "utf8");
}

export function getDefaultUserSettings(): IntellyUserSettings {
  return { ...defaultSettings };
}

export async function getStoredUser(email?: string | null): Promise<{
  user: IntellyUserProfile | null;
  settings: IntellyUserSettings | null;
}> {
  if (!email) {
    return {
      user: null,
      settings: null,
    };
  }

  const state = await readState();
  const user = state.users[email] ?? null;
  return {
    user,
    settings: user ? state.settingsByEmail[email] ?? getDefaultUserSettings() : null,
  };
}

export async function signInLocalUser(email: string): Promise<{
  user: IntellyUserProfile;
  settings: IntellyUserSettings;
}> {
  const state = await readState();
  const user: IntellyUserProfile = state.users[email] ?? {
    email,
    displayName: buildDisplayName(email),
  };
  const settings = state.settingsByEmail[email] ?? getDefaultUserSettings();

  state.users[email] = user;
  state.settingsByEmail[email] = settings;
  await writeState(state);

  return {
    user,
    settings,
  };
}

export async function updateUserSettings(
  email: string,
  settings: Partial<IntellyUserSettings>,
): Promise<IntellyUserSettings> {
  const state = await readState();
  const current = state.settingsByEmail[email] ?? getDefaultUserSettings();
  const preferredSections = settings.preferredSections?.filter(Boolean) as
    | IntellyPreferredSection[]
    | undefined;

  const merged: IntellyUserSettings = {
    preferredSections: preferredSections ?? current.preferredSections,
    pushEmailEnabled: settings.pushEmailEnabled ?? current.pushEmailEnabled,
    pushWechatEnabled: settings.pushWechatEnabled ?? current.pushWechatEnabled,
    dailyPushTime: settings.dailyPushTime ?? current.dailyPushTime,
  };

  state.settingsByEmail[email] = merged;
  if (!state.users[email]) {
    state.users[email] = {
      email,
      displayName: buildDisplayName(email),
    };
  }
  await writeState(state);

  return merged;
}

export async function listStoredUsers(): Promise<Array<{
  user: IntellyUserProfile;
  settings: IntellyUserSettings;
}>> {
  const state = await readState();

  return Object.values(state.users).map((user) => ({
    user,
    settings: state.settingsByEmail[user.email] ?? getDefaultUserSettings(),
  }));
}
